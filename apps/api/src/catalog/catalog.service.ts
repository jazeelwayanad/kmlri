import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async search(queryDto: SearchQueryDto) {
    const page = Math.max(1, Number(queryDto.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(queryDto.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    const andConditions: any[] = [];

    let activeCollection: { id: string; name: string; slug: string; description: string | null } | null = null;
    if (queryDto.collection) {
      activeCollection = await this.prisma.collection.findFirst({
        where: { OR: [{ slug: queryDto.collection }, { name: queryDto.collection }] },
        select: { id: true, name: true, slug: true, description: true },
      });
      where.collectionId = activeCollection ? activeCollection.id : '__none__';
    } else if (queryDto.collectionId) {
      where.collectionId = queryDto.collectionId;
    }

    if (queryDto.q) {
      andConditions.push(this.buildBooleanSearchClause(queryDto.q));
    }

    if (queryDto.format) {
      const formats = queryDto.format.split(',').map((f) => f.trim()).filter(Boolean);
      if (formats.length > 1) where.format = { in: formats };
      else if (formats.length === 1) where.format = formats[0];
    }

    if (queryDto.access) {
      const accessLevels = queryDto.access.split(',').map((a) => a.trim()).filter(Boolean);
      if (accessLevels.length > 1) where.accessLevel = { in: accessLevels };
      else if (accessLevels.length === 1) where.accessLevel = accessLevels[0];
    }

    if (queryDto.script) {
      const languages = queryDto.script.split(',').map((s) => s.trim()).filter(Boolean);
      if (languages.length > 1) where.language = { in: languages };
      else if (languages.length === 1) where.language = languages[0];
    }

    if (queryDto.subject) {
      where.subjects = { contains: queryDto.subject };
    }

    if (queryDto.yearFrom || queryDto.yearTo) {
      const from = queryDto.yearFrom ? parseInt(queryDto.yearFrom, 10) : -Infinity;
      const to = queryDto.yearTo ? parseInt(queryDto.yearTo, 10) : Infinity;
      const allYears = await this.prisma.bibliographicRecord.findMany({
        select: { id: true, publicationYear: true },
      });
      const idsInRange = allYears
        .filter((r) => {
          const y = parseInt(r.publicationYear || '', 10);
          return !isNaN(y) && y >= from && y <= to;
        })
        .map((r) => r.id);
      where.id = { in: idsInRange };
    }

    if (queryDto.author) {
      andConditions.push({
        OR: [{ authors: { contains: queryDto.author } }, { scribe: { contains: queryDto.author } }],
      });
    }

    if (queryDto.itemTypeCode || queryDto.libraryCode || queryDto.barcode || queryDto.accessionNumber) {
      andConditions.push({
        copies: {
          some: {
            ...(queryDto.itemTypeCode && { itemTypeCode: queryDto.itemTypeCode }),
            ...(queryDto.libraryCode && { homeLibraryCode: queryDto.libraryCode }),
            ...(queryDto.barcode && { barcode: { contains: queryDto.barcode } }),
            ...(queryDto.accessionNumber && { accessionNumber: queryDto.accessionNumber }),
          },
        },
      });
    }

    if (andConditions.length === 1) {
      Object.assign(where, andConditions[0]);
    } else if (andConditions.length > 1) {
      where.AND = andConditions;
    }

    const orderBy: any =
      queryDto.sortBy === 'title'
        ? { titleLatin: 'asc' }
        : queryDto.sortBy === 'year'
        ? { publicationYear: 'desc' }
        : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.bibliographicRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          copies: {
            select: {
              id: true,
              barcode: true,
              location: true,
              status: true,
              copyNumber: true,
            },
          },
          digitalFolios: {
            take: 4,
            select: {
              id: true,
              folioNumber: true,
              label: true,
              imageUrl: true,
              thumbnailUrl: true,
            },
          },
        },
      }),
      this.prisma.bibliographicRecord.count({ where }),
    ]);

    // Facet aggregation summaries (computed over the whole collection, not just this page)
    const [formatAgg, accessAgg, languageAgg] = await Promise.all([
      this.prisma.bibliographicRecord.groupBy({
        by: ['format'],
        _count: { format: true },
      }),
      this.prisma.bibliographicRecord.groupBy({
        by: ['accessLevel'],
        _count: { accessLevel: true },
      }),
      this.prisma.bibliographicRecord.groupBy({
        by: ['language'],
        _count: { language: true },
      }),
    ]);

    return {
      data: items.map((item) => ({
        ...item,
        authors: this.safeJsonParse(item.authors, []),
        subjects: this.safeJsonParse(item.subjects, []),
        availableCopiesCount: item.copies.filter((c) => c.status === 'AVAILABLE').length,
        totalCopiesCount: item.copies.length,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      collection: activeCollection,
      facets: {
        formats: formatAgg.map((f) => ({ key: f.format, count: f._count.format })),
        accessLevels: accessAgg.map((a) => ({ key: a.accessLevel, count: a._count.accessLevel })),
        languages: languageAgg.map((l) => ({ key: l.language, count: l._count.language })),
      },
    };
  }

  async update(id: string, dto: Partial<CreateRecordDto>) {
    const existing = await this.prisma.bibliographicRecord.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Bibliographic record #${id} not found.`);
    }

    if (dto.shelfmark && dto.shelfmark !== existing.shelfmark) {
      const clash = await this.prisma.bibliographicRecord.findUnique({
        where: { shelfmark: dto.shelfmark },
      });
      if (clash) {
        throw new ConflictException(`Shelfmark ${dto.shelfmark} is already in use.`);
      }
    }

    await this.prisma.bibliographicRecord.update({
      where: { id },
      data: {
        ...(dto.titleArabic !== undefined && { titleArabic: dto.titleArabic }),
        ...(dto.titleLatin !== undefined && { titleLatin: dto.titleLatin }),
        ...(dto.subtitle !== undefined && { subtitle: dto.subtitle }),
        ...(dto.statementOfResponsibility !== undefined && { statementOfResponsibility: dto.statementOfResponsibility }),
        ...(dto.authors !== undefined && { authors: JSON.stringify(dto.authors) }),
        ...(dto.scribe !== undefined && { scribe: dto.scribe }),
        ...(dto.shelfmark !== undefined && { shelfmark: dto.shelfmark }),
        ...(dto.callNumber !== undefined && { callNumber: dto.callNumber }),
        ...(dto.isbn !== undefined && { isbn: dto.isbn }),
        ...(dto.issn !== undefined && { issn: dto.issn }),
        ...(dto.doi !== undefined && { doi: dto.doi }),
        ...(dto.format !== undefined && { format: dto.format }),
        ...(dto.language !== undefined && { language: dto.language }),
        ...(dto.publicationYear !== undefined && { publicationYear: dto.publicationYear }),
        ...(dto.publisher !== undefined && { publisher: dto.publisher }),
        ...(dto.placeOfPublication !== undefined && { placeOfPublication: dto.placeOfPublication }),
        ...(dto.edition !== undefined && { edition: dto.edition }),
        ...(dto.series !== undefined && { series: dto.series }),
        ...(dto.extent !== undefined && { extent: dto.extent }),
        ...(dto.material !== undefined && { material: dto.material }),
        ...(dto.binding !== undefined && { binding: dto.binding }),
        ...(dto.provenance !== undefined && { provenance: dto.provenance }),
        ...(dto.summary !== undefined && { summary: dto.summary }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.subjects !== undefined && { subjects: JSON.stringify(dto.subjects) }),
        ...(dto.accessLevel !== undefined && { accessLevel: dto.accessLevel }),
        ...(dto.coverImageUrl !== undefined && { coverImageUrl: dto.coverImageUrl }),
        ...(dto.collectionId !== undefined && { collectionId: dto.collectionId || null }),
      },
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    const existing = await this.prisma.bibliographicRecord.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Bibliographic record #${id} not found.`);
    }
    await this.prisma.bibliographicRecord.delete({ where: { id } });
    return { success: true };
  }

  async findOne(idOrSlug: string) {
    const include = {
      copies: {
        include: {
          loans: {
            where: { status: 'ACTIVE' as const },
            select: { dueDate: true, user: { select: { fullName: true, membershipNumber: true } } },
          },
        },
      },
      digitalFolios: {
        orderBy: { folioNumber: 'asc' as const },
      },
    };

    let record = await this.prisma.bibliographicRecord.findUnique({
      where: { id: idOrSlug },
      include,
    });

    // Public item pages use human-readable slugs (from shelfmark/title), not raw ids.
    if (!record) {
      const candidates = await this.prisma.bibliographicRecord.findMany({ include });
      record =
        candidates.find(
          (r) => this.slugify(r.shelfmark) === idOrSlug || this.slugify(r.titleLatin) === idOrSlug,
        ) || null;
    }

    if (!record) {
      throw new NotFoundException(`Bibliographic record #${idOrSlug} not found.`);
    }

    // Related items in same format/subject
    const related = await this.prisma.bibliographicRecord.findMany({
      where: {
        format: record.format,
        id: { not: record.id },
      },
      take: 3,
      select: {
        id: true,
        titleLatin: true,
        titleArabic: true,
        authors: true,
        format: true,
        accessLevel: true,
        coverImageUrl: true,
      },
    });

    return {
      ...record,
      authors: this.safeJsonParse(record.authors, []),
      subjects: this.safeJsonParse(record.subjects, []),
      related: related.map((r) => ({
        ...r,
        authors: this.safeJsonParse(r.authors, []),
      })),
      citations: this.generateCitations(record),
    };
  }

  async create(dto: CreateRecordDto) {
    const existing = await this.prisma.bibliographicRecord.findUnique({
      where: { shelfmark: dto.shelfmark },
    });

    if (existing) {
      throw new ConflictException(`Shelfmark ${dto.shelfmark} is already in use.`);
    }

    const record = await this.prisma.bibliographicRecord.create({
      data: {
        titleArabic: dto.titleArabic,
        titleLatin: dto.titleLatin,
        subtitle: dto.subtitle,
        statementOfResponsibility: dto.statementOfResponsibility,
        authors: JSON.stringify(dto.authors || []),
        scribe: dto.scribe,
        shelfmark: dto.shelfmark,
        callNumber: dto.callNumber || dto.shelfmark,
        isbn: dto.isbn,
        issn: dto.issn,
        doi: dto.doi,
        format: dto.format || 'MANUSCRIPT',
        language: dto.language || 'Arabic',
        publicationYear: dto.publicationYear,
        publisher: dto.publisher,
        placeOfPublication: dto.placeOfPublication,
        edition: dto.edition,
        series: dto.series,
        extent: dto.extent,
        material: dto.material,
        binding: dto.binding,
        provenance: dto.provenance,
        summary: dto.summary,
        notes: dto.notes,
        subjects: JSON.stringify(dto.subjects || []),
        accessLevel: dto.accessLevel || 'DIGITISED_FULL',
        coverImageUrl: dto.coverImageUrl,
        collectionId: dto.collectionId || undefined,
      },
    });

    const copiesCount = dto.initialCopiesCount || 1;
    for (let i = 1; i <= copiesCount; i++) {
      const barcode = `${record.shelfmark.replace(/\s+/g, '')}-${String(i).padStart(2, '0')}`;
      await this.prisma.itemCopy.create({
        data: {
          bibRecordId: record.id,
          barcode,
          location: dto.initialLocation || 'Main Reading Room - Shelf A1',
          copyNumber: i,
          status: 'AVAILABLE',
        },
      });
    }

    const result = await this.findOne(record.id);
    if (!dto.skipDuplicateCheck) {
      const possibleDuplicates = (
        await this.findDuplicates({
          title: dto.titleLatin,
          author: (dto.authors && dto.authors[0]) || undefined,
          isbn: dto.isbn,
          issn: dto.issn,
        })
      ).filter((d) => d.id !== record.id);
      if (possibleDuplicates.length) {
        return { ...result, possibleDuplicates };
      }
    }
    return result;
  }

  async addCopy(
    bibRecordId: string,
    location?: string,
    barcodeCustom?: string,
    rfidTag?: string,
    status?: string,
    imageUrl?: string,
  ) {
    const record = await this.prisma.bibliographicRecord.findUnique({
      where: { id: bibRecordId },
      include: { copies: true },
    });

    if (!record) {
      throw new NotFoundException('Bibliographic record not found');
    }

    const nextCopyNumber = record.copies.length + 1;
    const barcode = barcodeCustom || `${record.shelfmark.replace(/\s+/g, '')}-${String(nextCopyNumber).padStart(2, '0')}`;

    return this.prisma.itemCopy.create({
      data: {
        bibRecordId,
        barcode,
        rfidTag: rfidTag || undefined,
        copyNumber: nextCopyNumber,
        location: location || 'Main Reading Room',
        status: status || 'AVAILABLE',
        imageUrl: imageUrl || undefined,
      },
    });
  }

  async updateCopy(
    copyId: string,
    data: { barcode?: string; rfidTag?: string; location?: string; status?: string; imageUrl?: string },
  ) {
    const existing = await this.prisma.itemCopy.findUnique({ where: { id: copyId } });
    if (!existing) {
      throw new NotFoundException('Item copy not found.');
    }
    return this.prisma.itemCopy.update({
      where: { id: copyId },
      data: {
        ...(data.barcode !== undefined && { barcode: data.barcode }),
        ...(data.rfidTag !== undefined && { rfidTag: data.rfidTag || null }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
      },
    });
  }

  async removeCopy(copyId: string) {
    const existing = await this.prisma.itemCopy.findUnique({
      where: { id: copyId },
      include: { loans: { where: { status: 'ACTIVE' } } },
    });
    if (!existing) {
      throw new NotFoundException('Item copy not found.');
    }
    if (existing.loans.length > 0) {
      throw new ConflictException('Cannot delete a copy that is currently on loan.');
    }
    await this.prisma.itemCopy.delete({ where: { id: copyId } });
    return { success: true };
  }

  private generateCitations(record: any) {
    const authors = this.safeJsonParse(record.authors, []);
    const authorStr = authors.length > 0 ? authors.join(', ') : record.scribe || 'Anonymous';
    const year = record.publicationYear || 'n.d.';
    const title = record.titleLatin;
    const shelf = record.shelfmark;

    return {
      apa: `${authorStr} (${year}). ${title} [${shelf}]. Kunhīn Musliyār Library & Research Institute.`,
      mla: `${authorStr}. ${title}. ${year}. Manuscript/Collection item ${shelf}, Kunhīn Musliyār Library & Research Institute.`,
      chicago: `${authorStr}. ${title}. Malabar: KMLRI Archives (${shelf}), ${year}.`,
      bibtex: `@misc{kmlri_${record.id},\n  author = {${authorStr}},\n  title = {${title}},\n  year = {${year}},\n  note = {Shelfmark: ${shelf}, KMLRI}\n}`,
    };
  }

  private readonly SEARCHABLE_FIELDS = [
    'titleLatin',
    'titleArabic',
    'authors',
    'shelfmark',
    'subjects',
    'summary',
    'scribe',
  ] as const;

  /**
   * Parses a query string for AND/OR/NOT boolean operators (case-insensitive, space
   * separated, e.g. "history AND arabic NOT manuscript") and builds a Prisma where-clause
   * across the searchable text fields. Falls back to a single substring OR-match across
   * those fields when no boolean operators are present (previous default behaviour).
   */
  private buildBooleanSearchClause(q: string): any {
    const tokens = q.trim().split(/\s+/).filter(Boolean);
    const hasBoolean = tokens.some((t) => ['AND', 'OR', 'NOT'].includes(t.toUpperCase()));

    const termClause = (term: string) => ({
      OR: this.SEARCHABLE_FIELDS.map((field) => ({ [field]: { contains: term } })),
    });

    if (!hasBoolean) {
      return termClause(q.trim());
    }

    // Simple left-to-right evaluation: term (AND|OR|NOT) term (AND|OR|NOT) term ...
    // NOT binds to the following term as an AND NOT.
    const and: any[] = [];
    let pendingOp: 'AND' | 'OR' | 'NOT' = 'AND';
    let orGroup: any[] = [];

    const flushOrGroup = () => {
      if (orGroup.length === 1) and.push(orGroup[0]);
      else if (orGroup.length > 1) and.push({ OR: orGroup });
      orGroup = [];
    };

    for (const token of tokens) {
      const upper = token.toUpperCase();
      if (upper === 'AND' || upper === 'OR' || upper === 'NOT') {
        if (upper !== 'OR') flushOrGroup();
        pendingOp = upper as 'AND' | 'OR' | 'NOT';
        continue;
      }
      const clause = termClause(token);
      if (pendingOp === 'OR') {
        orGroup.push(clause);
      } else if (pendingOp === 'NOT') {
        flushOrGroup();
        and.push({ NOT: clause });
      } else {
        flushOrGroup();
        orGroup.push(clause);
      }
    }
    flushOrGroup();

    return and.length === 1 ? and[0] : { AND: and };
  }

  /**
   * Duplicate detection: ranks candidates by match strength -- exact ISBN/ISSN match
   * (strongest), then case-insensitive exact title+author match, then fuzzy substring
   * title match combined with the same first-author token.
   */
  async findDuplicates(query: { title?: string; author?: string; isbn?: string; issn?: string }) {
    const results: any[] = [];
    const seen = new Set<string>();
    const select = {
      id: true,
      titleLatin: true,
      authors: true,
      isbn: true,
      issn: true,
      publicationYear: true,
      shelfmark: true,
    };

    const push = (records: any[], strength: 'EXACT_IDENTIFIER' | 'EXACT_TITLE_AUTHOR' | 'FUZZY') => {
      for (const r of records) {
        if (seen.has(r.id)) continue;
        seen.add(r.id);
        results.push({ ...r, authors: this.safeJsonParse(r.authors, []), matchStrength: strength });
      }
    };

    if (query.isbn) {
      push(await this.prisma.bibliographicRecord.findMany({ where: { isbn: query.isbn }, select }), 'EXACT_IDENTIFIER');
    }
    if (query.issn) {
      push(await this.prisma.bibliographicRecord.findMany({ where: { issn: query.issn }, select }), 'EXACT_IDENTIFIER');
    }

    if (query.title && query.author) {
      const exact = await this.prisma.bibliographicRecord.findMany({
        where: {
          titleLatin: { equals: query.title, mode: 'insensitive' },
          authors: { contains: query.author },
        },
        select,
      });
      push(exact, 'EXACT_TITLE_AUTHOR');
    }

    if (query.title) {
      const firstAuthorToken = query.author?.split(/\s+/)[0];
      const fuzzy = await this.prisma.bibliographicRecord.findMany({
        where: {
          titleLatin: { contains: query.title },
          ...(firstAuthorToken && { authors: { contains: firstAuthorToken } }),
        },
        select,
        take: 25,
      });
      push(fuzzy, 'FUZZY');
    }

    return results;
  }

  /** Exports bibliographic records as MARCXML or a flat CSV. */
  async exportRecords(format: 'marcxml' | 'csv', ids?: string[]) {
    const EXPORT_SAFETY_CAP = 5000;
    const records = await this.prisma.bibliographicRecord.findMany({
      where: ids && ids.length ? { id: { in: ids } } : undefined,
      take: EXPORT_SAFETY_CAP,
      orderBy: { createdAt: 'asc' },
    });

    if (format === 'csv') {
      return this.toCsv(records);
    }
    return this.toMarcXml(records);
  }

  private toCsv(records: any[]): string {
    const columns = [
      'id', 'kohaBiblionumber', 'titleLatin', 'titleArabic', 'authors', 'shelfmark', 'callNumber',
      'isbn', 'issn', 'format', 'language', 'publicationYear', 'publisher', 'placeOfPublication',
      'edition', 'series', 'notes', 'subjects', 'accessLevel',
    ];
    const escape = (v: any) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [columns.join(',')];
    for (const r of records) {
      const row = { ...r, authors: this.safeJsonParse(r.authors, []).join('; '), subjects: this.safeJsonParse(r.subjects, []).join('; ') };
      lines.push(columns.map((c) => escape((row as any)[c])).join(','));
    }
    return lines.join('\n');
  }

  private toMarcXml(records: any[]): string {
    const esc = (v: any) =>
      String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const df = (tag: string, subfields: Array<[string, any]>) => {
      const present = subfields.filter(([, v]) => v !== undefined && v !== null && v !== '');
      if (!present.length) return '';
      const subs = present.map(([code, v]) => `<subfield code="${code}">${esc(v)}</subfield>`).join('');
      return `<datafield tag="${tag}" ind1=" " ind2=" ">${subs}</datafield>`;
    };

    const recordsXml = records
      .map((r) => {
        const authors = this.safeJsonParse(r.authors, []) as string[];
        const subjects = this.safeJsonParse(r.subjects, []) as string[];
        const controlNumber = r.kohaBiblionumber ?? r.id;
        const fields = [
          `<controlfield tag="001">${esc(controlNumber)}</controlfield>`,
          df('020', [['a', r.isbn]]),
          df('022', [['a', r.issn]]),
          df('041', [['a', r.language]]),
          authors[0] ? df('100', [['a', authors[0]]]) : '',
          df('245', [['a', r.titleLatin], ['c', r.statementOfResponsibility]]),
          df('250', [['a', r.edition]]),
          df('260', [['a', r.placeOfPublication], ['b', r.publisher], ['c', r.publicationYear]]),
          df('300', [['a', r.extent]]),
          df('490', [['a', r.series]]),
          df('500', [['a', r.notes]]),
          df('520', [['a', r.summary]]),
          ...subjects.map((s) => df('650', [['a', s]])),
          ...authors.slice(1).map((a) => df('700', [['a', a]])),
        ]
          .filter(Boolean)
          .join('');
        return `<record><leader>00000nam a2200000 a 4500</leader>${fields}</record>`;
      })
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?><collection xmlns="http://www.loc.gov/MARC21/slim">${recordsXml}</collection>`;
  }

  /**
   * Imports accession-register-style rows (same shape as the standalone Koha migration
   * script at apps/api/prisma/migrate-koha-accession.ts): biblionumber, Barcode, AccDate,
   * CallNo, ISBN, Author, Title, Ed, Year, Place, Pub, Pages, Subject, Location,
   * UniformTitle, Language. Upserts BibliographicRecord + ItemCopy per row, grouped by
   * biblionumber, using the same mapping rules as that script.
   */
  async importRecords(rows: Record<string, string>[]) {
    const clean = (v: string | undefined) => {
      const t = (v ?? '').trim();
      return t.length ? t : undefined;
    };
    const parseDate = (v: string | undefined) => {
      const t = clean(v);
      if (!t) return undefined;
      const d = new Date(t);
      return isNaN(d.getTime()) ? undefined : d;
    };

    const byBiblio = new Map<string, Record<string, string>[]>();
    const errors: Array<{ row: number; reason: string }> = [];
    rows.forEach((row, idx) => {
      const biblio = clean(row.biblionumber) ?? clean(row.Barcode) ?? String(idx);
      const title = clean(row.Title);
      if (!title) {
        errors.push({ row: idx, reason: 'missing Title' });
        return;
      }
      if (!byBiblio.has(biblio)) byBiblio.set(biblio, []);
      byBiblio.get(biblio)!.push(row);
    });

    let created = 0;
    let updated = 0;
    const usedShelfmarks = new Set<string>();
    const usedBarcodes = new Set<string>();

    for (const [biblioKey, group] of byBiblio.entries()) {
      const r0 = group[0];
      const isSerial = group.length > 1;
      const kohaBiblionumber = /^\d+$/.test(biblioKey) ? parseInt(biblioKey, 10) : undefined;

      let shelfmark = clean(r0.CallNo) ?? `IMPORT-${biblioKey}`;
      if (usedShelfmarks.has(shelfmark)) shelfmark = `IMPORT-${biblioKey}`;
      usedShelfmarks.add(shelfmark);

      const existing = kohaBiblionumber
        ? await this.prisma.bibliographicRecord.findUnique({ where: { kohaBiblionumber } })
        : await this.prisma.bibliographicRecord.findUnique({ where: { shelfmark } }).catch(() => null);

      const author = clean(r0.Author);
      const subject = clean(r0.Subject);
      const data = {
        titleLatin: clean(r0.Title) ?? `Untitled (${biblioKey})`,
        titleArabic: clean(r0.UniformTitle),
        authors: JSON.stringify(author ? [author] : []),
        subjects: JSON.stringify(subject ? [subject] : []),
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
        ...(kohaBiblionumber !== undefined && { kohaBiblionumber }),
      };

      const bib = existing
        ? await this.prisma.bibliographicRecord.update({ where: { id: existing.id }, data })
        : await this.prisma.bibliographicRecord.create({ data: { ...data, accessLevel: 'READING_ROOM_ONLY' } });
      existing ? updated++ : created++;

      for (let i = 0; i < group.length; i++) {
        const row = group[i];
        let barcode = clean(row.Barcode) ?? `IMPORT-${biblioKey}-${i + 1}`;
        if (usedBarcodes.has(barcode)) barcode = `${barcode}-${Math.random().toString(36).slice(2, 6)}`;
        usedBarcodes.add(barcode);
        const already = await this.prisma.itemCopy.findUnique({ where: { barcode } });
        if (already) continue;
        await this.prisma.itemCopy.create({
          data: {
            bibRecordId: bib.id,
            barcode,
            location: clean(row.Location) ?? 'Unspecified',
            copyNumber: i + 1,
            accessionNumber: biblioKey,
            itemTypeCode: isSerial ? 'PERIODICAL' : 'BOOK',
            collectionCode: clean(row.Location),
            dateAcquired: parseDate(row.AccDate),
          },
        });
      }
    }

    return { created, updated, skipped: errors.length, errors };
  }

  private slugify(text?: string | null): string {
    if (!text) return '';
    const diacritics = new RegExp('[̀-ͯ]', 'g');
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(diacritics, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  private safeJsonParse(val: string, fallback: any) {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
}
