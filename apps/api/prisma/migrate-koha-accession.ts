/**
 * Migrates the Koha "Accession Register" export (prisma/migration-data/koha-accession-register.json,
 * converted from the source .ods) into the Postgres schema.
 *
 * Source columns: biblionumber, Barcode, AccDate, CallNo, ISBN, Author, Title, Ed, Year, Place,
 * Pub, Pages, Subject, Location, UniformTitle, Language.
 *
 * The export is a flat accession register, not a full Koha DB dump: it carries no MARC, item
 * type, branch, vendor, or subscription data. Mapping applied:
 *
 *  - Rows are grouped by biblionumber. A biblionumber with >1 row is treated as a serial
 *    (each row = one issue physically accessioned); a biblionumber with exactly 1 row is a
 *    monograph.
 *  - Monograph group -> one BibliographicRecord (format BOOK) + one ItemCopy.
 *  - Serial group -> one BibliographicRecord (format PERIODICAL, recordType SERIAL_BIBLIO), one
 *    Serial (subscription) row, and one SerialIssue + one ItemCopy per accessioned row. The
 *    subscription's periodicityCode is inferred from the median day-gap between AccDate values.
 *  - `Location` values (Arabic/Malayalam/Urdu/English/etc, plus named special collections) are
 *    not Koha branches -- they are used as ItemCopy.collectionCode, backed by a new
 *    AuthorisedValueCategory "CCODE".
 *  - `biblionumber` is preserved verbatim as BibliographicRecord.kohaBiblionumber for traceability.
 *  - Author / Subject text values become AuthorityRecord rows (PERSONAL_NAME / SUBJECT), deduped
 *    by exact heading text, and linked to their bib records via BibliographicHeading -- this is
 *    the "prevent duplicate headings" mechanism for authority control.
 *  - A single default Library ("MAIN") and a default MarcFramework ("DEFAULT") + ("SERIAL") are
 *    seeded since the source data carries no branch or framework information.
 *
 * Run: npx ts-node prisma/migrate-koha-accession.ts [--dry-run]
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Plain DATABASE_URL (unmodified): appending &pgbouncer=true was tried to work around
// earlier stalls and instead broke schema visibility (P2021 "table does not exist"),
// and &connection_limit=1 didn't fix the stalls either. The default connection string
// works fine for individual calls; resilience against transient stalls/cold-starts is
// instead handled per-call by withRetry()'s timeout + backoff below.
const prisma = new PrismaClient();

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
}

/** Retries a Prisma call with exponential backoff on transient connection errors or a stall. */
async function withRetry<T>(fn: () => Promise<T>, label: string, attempts = 5): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await withTimeout(fn(), 15000, label);
    } catch (err: any) {
      lastErr = err;
      const delay = 500 * Math.pow(2, i);
      console.warn(`[retry] ${label} failed (attempt ${i + 1}/${attempts}): ${err?.message ?? err}. Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

interface SourceRow {
  biblionumber: string;
  Barcode: string;
  AccDate: string;
  CallNo: string;
  ISBN: string;
  Author: string;
  Title: string;
  Ed: string;
  Year: string;
  Place: string;
  Pub: string;
  Pages: string;
  Subject: string;
  Location: string;
  UniformTitle: string;
  Language: string;
}

const DRY_RUN = process.argv.includes('--dry-run');
const BATCH = 300;

function clean(v: string | undefined): string | undefined {
  const t = (v ?? '').trim();
  return t.length ? t : undefined;
}

function parseDate(v: string | undefined): Date | undefined {
  const t = clean(v);
  if (!t) return undefined;
  const d = new Date(t);
  return isNaN(d.getTime()) ? undefined : d;
}

function inferPeriodicity(dates: Date[]): string {
  if (dates.length < 2) return 'IRREGULAR';
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push((sorted[i].getTime() - sorted[i - 1].getTime()) / 86400000);
  }
  gaps.sort((a, b) => a - b);
  const median = gaps[Math.floor(gaps.length / 2)];
  if (median <= 1.5) return 'DAILY';
  if (median <= 10) return 'WEEKLY';
  if (median <= 18) return 'BIWEEKLY';
  if (median <= 35) return 'MONTHLY';
  if (median <= 70) return 'BIMONTHLY';
  if (median <= 100) return 'QUARTERLY';
  if (median <= 200) return 'SEMIANNUAL';
  if (median <= 400) return 'ANNUAL';
  return 'IRREGULAR';
}

async function chunked<T>(items: T[], size: number, fn: (batch: T[], batchIndex: number) => Promise<void>) {
  for (let i = 0; i < items.length; i += size) {
    await fn(items.slice(i, i + size), i / size);
  }
}

async function main() {
  const jsonPath = path.join(__dirname, 'migration-data', 'koha-accession-register.json');
  const raw: SourceRow[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Loaded ${raw.length} source rows from ${jsonPath}`);

  const skipped: { row: SourceRow; reason: string }[] = [];
  const byBiblio = new Map<string, SourceRow[]>();
  for (const row of raw) {
    const biblio = clean(row.biblionumber);
    if (!biblio || !clean(row.Title)) {
      skipped.push({ row, reason: 'missing biblionumber or Title' });
      continue;
    }
    if (!byBiblio.has(biblio)) byBiblio.set(biblio, []);
    byBiblio.get(biblio)!.push(row);
  }
  console.log(`Grouped into ${byBiblio.size} unique biblionumbers (${skipped.length} rows skipped)`);

  // --- 1. Seed reference data (Library, ItemType, AuthorisedValueCategory/Values, MarcFrameworks) ---
  const locationSet = new Set<string>();
  for (const rows of byBiblio.values()) for (const r of rows) { const l = clean(r.Location); if (l) locationSet.add(l); }

  if (!DRY_RUN) {
    await prisma.library.upsert({
      where: { code: 'MAIN' },
      update: {},
      create: { code: 'MAIN', name: 'Main Library', isActive: true },
    });

    const itemTypes: Array<{ code: string; description: string; isSerial: boolean }> = [
      { code: 'BOOK', description: 'Book / Monograph', isSerial: false },
      { code: 'PERIODICAL', description: 'Periodical / Serial issue', isSerial: true },
      { code: 'MANUSCRIPT', description: 'Manuscript', isSerial: false },
      { code: 'RARE_BOOK', description: 'Rare book', isSerial: false },
      { code: 'THESIS', description: 'Thesis / Dissertation', isSerial: false },
      { code: 'AUDIO', description: 'Audio / Visual material', isSerial: false },
    ];
    for (const it of itemTypes) {
      await prisma.itemType.upsert({ where: { code: it.code }, update: {}, create: it });
    }

    const ccodeCategory = await prisma.authorisedValueCategory.upsert({
      where: { category: 'CCODE' },
      update: {},
      create: { category: 'CCODE', description: 'Collection / shelving location code (from Koha "Location")' },
    });
    let sortOrder = 0;
    for (const loc of Array.from(locationSet).sort()) {
      await prisma.authorisedValue.upsert({
        where: { categoryId_code: { categoryId: ccodeCategory.id, code: loc } },
        update: {},
        create: { categoryId: ccodeCategory.id, code: loc, description: loc, sortOrder: sortOrder++ },
      });
    }

    const defaultFramework = await prisma.marcFramework.upsert({
      where: { code: 'DEFAULT' },
      update: {},
      create: { code: 'DEFAULT', description: 'Default bibliographic framework', isDefault: true },
    });
    const defaultFields: Array<{ tag: string; subfield?: string; label: string; mappedField?: string; mandatory?: boolean; repeatable?: boolean }> = [
      { tag: '020', subfield: 'a', label: 'ISBN', mappedField: 'isbn' },
      { tag: '022', subfield: 'a', label: 'ISSN', mappedField: 'issn' },
      { tag: '041', subfield: 'a', label: 'Language', mappedField: 'language' },
      { tag: '100', subfield: 'a', label: 'Main entry - personal name', mappedField: 'authors', repeatable: true },
      { tag: '130', subfield: 'a', label: 'Uniform title', mappedField: 'titleArabic' },
      { tag: '240', subfield: 'a', label: 'Uniform title', mappedField: 'titleArabic' },
      { tag: '245', subfield: 'a', label: 'Title', mappedField: 'titleLatin', mandatory: true },
      { tag: '245', subfield: 'c', label: 'Statement of responsibility', mappedField: 'statementOfResponsibility' },
      { tag: '250', subfield: 'a', label: 'Edition', mappedField: 'edition' },
      { tag: '260', subfield: 'a', label: 'Place of publication', mappedField: 'placeOfPublication' },
      { tag: '260', subfield: 'b', label: 'Publisher', mappedField: 'publisher' },
      { tag: '260', subfield: 'c', label: 'Date of publication', mappedField: 'publicationYear' },
      { tag: '300', subfield: 'a', label: 'Extent', mappedField: 'extent' },
      { tag: '490', subfield: 'a', label: 'Series', mappedField: 'series' },
      { tag: '500', subfield: 'a', label: 'General note', mappedField: 'notes' },
      { tag: '520', subfield: 'a', label: 'Summary', mappedField: 'summary' },
      { tag: '600', subfield: 'a', label: 'Subject - personal name', mappedField: 'subjects', repeatable: true },
      { tag: '650', subfield: 'a', label: 'Subject - topical', mappedField: 'subjects', repeatable: true },
      { tag: '700', subfield: 'a', label: 'Added entry - personal name', mappedField: 'authors', repeatable: true },
      { tag: '852', subfield: 'a', label: 'Location', mappedField: 'collectionCode' },
      { tag: '852', subfield: 'j', label: 'Call number', mappedField: 'callNumber' },
    ];
    let fSort = 0;
    for (const f of defaultFields) {
      await prisma.marcFrameworkField.upsert({
        where: { frameworkId_tag_subfield: { frameworkId: defaultFramework.id, tag: f.tag, subfield: f.subfield ?? '' } },
        update: {},
        create: {
          frameworkId: defaultFramework.id, tag: f.tag, subfield: f.subfield, label: f.label,
          mappedField: f.mappedField, mandatory: f.mandatory ?? false, repeatable: f.repeatable ?? false, sortOrder: fSort++,
        },
      });
    }

    const serialFramework = await prisma.marcFramework.upsert({
      where: { code: 'SERIAL' },
      update: {},
      create: { code: 'SERIAL', description: 'Serial / periodical framework', materialType: 'PERIODICAL' },
    });
    const serialFields = [
      ...defaultFields,
      { tag: '310', subfield: 'a', label: 'Current publication frequency', mappedField: 'frequency' },
      { tag: '362', subfield: 'a', label: 'Dates/volumes of publication', mappedField: 'numberingPattern' },
    ];
    let sSort = 0;
    for (const f of serialFields) {
      await prisma.marcFrameworkField.upsert({
        where: { frameworkId_tag_subfield: { frameworkId: serialFramework.id, tag: f.tag, subfield: f.subfield ?? '' } },
        update: {},
        create: {
          frameworkId: serialFramework.id, tag: f.tag, subfield: f.subfield, label: f.label,
          mappedField: (f as any).mappedField, mandatory: (f as any).mandatory ?? false, repeatable: (f as any).repeatable ?? false, sortOrder: sSort++,
        },
      });
    }
    console.log('Seeded Library, ItemType, AuthorisedValue(CCODE), MarcFrameworks (DEFAULT, SERIAL)');
  }

  // --- 2. Authority records (dedup by heading text) ---
  const authorHeadings = new Set<string>();
  const subjectHeadings = new Set<string>();
  for (const rows of byBiblio.values()) {
    const r0 = rows[0];
    const a = clean(r0.Author);
    if (a) authorHeadings.add(a);
    const s = clean(r0.Subject);
    if (s) subjectHeadings.add(s);
  }
  console.log(`Found ${authorHeadings.size} unique author headings, ${subjectHeadings.size} unique subject headings`);

  const authorityIdByHeading = new Map<string, string>();
  if (!DRY_RUN) {
    let authProgress = 0;
    const authTotal = authorHeadings.size + subjectHeadings.size;
    await chunked(Array.from(authorHeadings), BATCH, async (batch) => {
      for (const heading of batch) {
        const rec = await withRetry(
          () =>
            prisma.authorityRecord.upsert({
              where: { headingType_heading: { headingType: 'PERSONAL_NAME', heading } },
              update: {},
              create: { headingType: 'PERSONAL_NAME', heading },
            }),
          `authority PERSONAL_NAME "${heading}"`,
        );
        authorityIdByHeading.set(`PERSONAL_NAME::${heading}`, rec.id);
        authProgress++;
        if (authProgress % 200 === 0) process.stdout.write(`\rSeeding authorities ${authProgress}/${authTotal}...`);
      }
    });
    await chunked(Array.from(subjectHeadings), BATCH, async (batch) => {
      for (const heading of batch) {
        const rec = await withRetry(
          () =>
            prisma.authorityRecord.upsert({
              where: { headingType_heading: { headingType: 'SUBJECT', heading } },
              update: {},
              create: { headingType: 'SUBJECT', heading },
            }),
          `authority SUBJECT "${heading}"`,
        );
        authorityIdByHeading.set(`SUBJECT::${heading}`, rec.id);
        authProgress++;
        if (authProgress % 200 === 0) process.stdout.write(`\rSeeding authorities ${authProgress}/${authTotal}...`);
      }
    });
    console.log('\nSeeded authority records');
  }

  // --- 3. Bibliographic records + items (+ serials for grouped biblionumbers) ---
  const usedShelfmarks = new Set<string>();
  const usedBarcodes = new Set<string>();
  let biblioCreated = 0, itemsCreated = 0, serialsCreated = 0, issuesCreated = 0, headingsCreated = 0;

  const groups = Array.from(byBiblio.entries());
  await chunked(groups, 50, async (batch) => {
    for (const [biblioNum, rows] of batch) {
      const r0 = rows[0];
      const isSerial = rows.length > 1;
      const kohaBiblionumber = parseInt(biblioNum, 10);

      let shelfmark = clean(r0.CallNo) ?? `ACC-${biblioNum}`;
      if (usedShelfmarks.has(shelfmark)) shelfmark = `ACC-${biblioNum}`;
      if (usedShelfmarks.has(shelfmark)) shelfmark = `ACC-${biblioNum}-${Math.random().toString(36).slice(2, 6)}`;
      usedShelfmarks.add(shelfmark);

      const authorHeading = clean(r0.Author);
      const subjectHeading = clean(r0.Subject);

      if (DRY_RUN) {
        biblioCreated++;
        itemsCreated += rows.length;
        if (isSerial) { serialsCreated++; issuesCreated += rows.length; }
        continue;
      }

      const bib = await withRetry(() => prisma.bibliographicRecord.upsert({
        where: { kohaBiblionumber },
        update: {},
        create: {
          titleLatin: clean(r0.Title) ?? `Untitled (biblio ${biblioNum})`,
          titleArabic: clean(r0.UniformTitle),
          authors: JSON.stringify(authorHeading ? [authorHeading] : []),
          subjects: JSON.stringify(subjectHeading ? [subjectHeading] : []),
          shelfmark,
          callNumber: clean(r0.CallNo),
          isbn: clean(r0.ISBN),
          format: isSerial ? 'PERIODICAL' : 'BOOK',
          recordType: isSerial ? 'SERIAL_BIBLIO' : 'BIBLIO',
          frameworkCode: isSerial ? 'SERIAL' : 'DEFAULT',
          language: clean(r0.Language) ?? 'Unspecified',
          publicationYear: clean(r0.Year),
          publisher: clean(r0.Pub),
          placeOfPublication: clean(r0.Place),
          edition: clean(r0.Ed),
          extent: clean(r0.Pages),
          accessLevel: 'READING_ROOM_ONLY',
          kohaBiblionumber,
        },
      }), `bib upsert ${biblioNum}`);
      biblioCreated++;

      if (authorHeading) {
        const authorityId = authorityIdByHeading.get(`PERSONAL_NAME::${authorHeading}`);
        if (authorityId) {
          await withRetry(() => prisma.bibliographicHeading.upsert({
            where: { bibRecordId_authorityId_tag: { bibRecordId: bib.id, authorityId, tag: '100' } },
            update: {},
            create: { bibRecordId: bib.id, authorityId, tag: '100', subfield: 'a' },
          }), `heading 100 ${biblioNum}`);
          headingsCreated++;
        }
      }
      if (subjectHeading) {
        const authorityId = authorityIdByHeading.get(`SUBJECT::${subjectHeading}`);
        if (authorityId) {
          await withRetry(() => prisma.bibliographicHeading.upsert({
            where: { bibRecordId_authorityId_tag: { bibRecordId: bib.id, authorityId, tag: '650' } },
            update: {},
            create: { bibRecordId: bib.id, authorityId, tag: '650', subfield: 'a' },
          }), `heading 650 ${biblioNum}`);
          headingsCreated++;
        }
      }

      let serialId: string | undefined;
      if (isSerial) {
        const accDates = rows.map((r) => parseDate(r.AccDate)).filter((d): d is Date => !!d);
        const periodicityCode = inferPeriodicity(accDates);
        const serial = await withRetry(() => prisma.serial.upsert({
          where: { bibRecordId: bib.id },
          update: {},
          create: {
            title: clean(r0.Title) ?? `Untitled (biblio ${biblioNum})`,
            shelfmark,
            periodicityCode,
            frequency: periodicityCode.charAt(0) + periodicityCode.slice(1).toLowerCase(),
            publisher: clean(r0.Pub),
            bibRecordId: bib.id,
            libraryId: undefined,
            startDate: accDates.length ? new Date(Math.min(...accDates.map((d) => d.getTime()))) : undefined,
            status: 'ACTIVE',
          },
        }), `serial upsert ${biblioNum}`);
        serialId = serial.id;
        serialsCreated++;
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        let barcode = clean(row.Barcode) ?? `KOHA-${biblioNum}-${i + 1}`;
        if (usedBarcodes.has(barcode)) barcode = `KOHA-${biblioNum}-${i + 1}-${Math.random().toString(36).slice(2, 6)}`;
        usedBarcodes.add(barcode);
        const accDate = parseDate(row.AccDate);

        await withRetry(() => prisma.itemCopy.create({
          data: {
            bibRecordId: bib.id,
            barcode,
            location: clean(row.Location) ?? 'Unspecified',
            copyNumber: i + 1,
            accessionNumber: biblioNum,
            itemTypeCode: isSerial ? 'PERIODICAL' : 'BOOK',
            collectionCode: clean(row.Location),
            homeLibraryCode: 'MAIN',
            currentLibraryCode: 'MAIN',
            dateAcquired: accDate,
          },
        }), `item create ${biblioNum}-${i + 1}`);
        itemsCreated++;

        if (isSerial && serialId) {
          await withRetry(() => prisma.serialIssue.create({
            data: {
              serialId,
              issueLabel: accDate ? accDate.toISOString().slice(0, 10) : `Issue ${i + 1}`,
              publicationDate: accDate,
              receivedDate: accDate,
              status: 'RECEIVED',
            },
          }), `issue create ${biblioNum}-${i + 1}`);
          issuesCreated++;
        }
      }
    }
    process.stdout.write(`\rProcessed ${Math.min(groups.indexOf(batch[batch.length - 1]) + 1, groups.length)}/${groups.length} biblio groups...`);
  });
  console.log('');

  console.log('--- Migration summary ---');
  console.log(`Bibliographic records: ${biblioCreated}`);
  console.log(`Item copies:           ${itemsCreated}`);
  console.log(`Serial subscriptions:  ${serialsCreated}`);
  console.log(`Serial issues:         ${issuesCreated}`);
  console.log(`Bib->authority headings: ${headingsCreated}`);
  console.log(`Skipped source rows:   ${skipped.length}`);
  if (skipped.length) {
    console.log('Skip reasons sample:', skipped.slice(0, 5).map((s) => s.reason));
  }
  if (DRY_RUN) console.log('(dry run - no data was written)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
