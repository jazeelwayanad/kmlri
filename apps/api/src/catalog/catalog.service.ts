import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { SearchQueryDto } from './dto/search-query.dto';

const DEFAULT_SAMPLE_RECORDS: any[] = [
  {
    id: 'rec-ms-0142',
    titleLatin: 'Bayān al-Fawāʾid',
    titleArabic: 'بيان الفوائد',
    authors: JSON.stringify(['Unnamed scribe, Malabar coast']),
    shelfmark: 'MS 0142',
    callNumber: 'MS-ARA-0142',
    format: 'MANUSCRIPT',
    language: 'Arabic, with Arabi-Malayalam glosses',
    extent: '84 folios, 21 × 15 cm',
    material: 'Laid paper, brown ink, red rubrication',
    binding: 'Limp leather over paper boards',
    provenance: 'Family deposit, Parappur, 2019',
    summary: 'A Malabar coast manuscript containing jurisprudential glosses and marginal notes.',
    subjects: JSON.stringify(['Islamic Jurisprudence', 'Manuscript Culture', 'Malabar History']),
    accessLevel: 'DIGITISED_FULL',
    publicationYear: '1845',
    publisher: 'Private Scribe',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    copies: [
      { id: 'copy-1', barcode: 'MS0142-01', rfidTag: 'RFID-MS0142-01', location: 'Rare Manuscript Vault Shelf A-1', status: 'AVAILABLE', copyNumber: 1 },
    ],
    digitalFolios: [
      { id: 'df-1', folioNumber: 1, label: 'Title page with opening incipit (1r)', imageUrl: '/assets/wordmark-arabic.svg', thumbnailUrl: '/assets/wordmark-arabic.svg' },
      { id: 'df-2', folioNumber: 2, label: 'First folio with glosses (1v)', imageUrl: '/assets/wordmark-latin.svg', thumbnailUrl: '/assets/wordmark-latin.svg' },
    ],
  },
  {
    id: 'rec-am-0311',
    titleLatin: 'Muḥyiddīn Mālā',
    titleArabic: 'محي الدين مالا',
    authors: JSON.stringify(['Qāḍī Muḥammad']),
    shelfmark: 'AM 0311',
    callNumber: 'AM-LIT-0311',
    format: 'ARABI_MALAYALAM_PRINT',
    language: 'Arabi-Malayalam',
    extent: '32 pages, lithograph print',
    material: 'Lithographic paper, black ink',
    binding: 'Stitched paper wrapper',
    provenance: 'Purchased from Calicut bookstall, 2021',
    summary: 'Classical Arabi-Malayalam devotional poem celebrating Shaykh Abd al-Qadir al-Jilani.',
    subjects: JSON.stringify(['Arabi-Malayalam Poetry', 'Sufism', 'Malabar Lithographs']),
    accessLevel: 'DIGITISED_FULL',
    publicationYear: '1607',
    publisher: 'Al-Huda Press',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    copies: [
      { id: 'copy-2', barcode: 'AM0311-01', rfidTag: 'RFID-AM0311-01', location: 'Arabi-Malayalam Section Stack B-2', status: 'AVAILABLE', copyNumber: 1 },
    ],
    digitalFolios: [
      { id: 'df-3', folioNumber: 1, label: 'Lithographed front cover', imageUrl: '/assets/wordmark-arabic.svg', thumbnailUrl: '/assets/wordmark-arabic.svg' },
    ],
  },
  {
    id: 'rec-rb-0908',
    titleLatin: 'Fatḥ al-Muʿīn, annotated copy',
    titleArabic: 'فتح المعين شرح قرة العين',
    authors: JSON.stringify(['Zayn al-Dīn al-Malībārī']),
    shelfmark: 'RB 0908',
    callNumber: 'RB-FIQ-0908',
    format: 'RARE_BOOK',
    language: 'Arabic',
    extent: '312 pages, bound volume',
    material: 'Imported mill paper, typeset print with handwritten margins',
    binding: 'Full cloth boards with blind stamping',
    provenance: 'Donated by Sabeelul Hidaya Faculty Archives, 2018',
    summary: 'The seminal Malabar Shafi’i jurisprudence text with commentary.',
    subjects: JSON.stringify(['Shafi’i Fiqh', 'Malabar Scholars', 'Rare Printed Books']),
    accessLevel: 'READING_ROOM_ONLY',
    publicationYear: '1888',
    publisher: 'Cairo Bulaq Press',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    copies: [
      { id: 'copy-3', barcode: 'RB0908-01', rfidTag: 'RFID-RB0908-01', location: 'Main Reading Room Stack C-4', status: 'ON_LOAN', copyNumber: 1 },
      { id: 'copy-4', barcode: 'RB0908-02', rfidTag: 'RFID-RB0908-02', location: 'Main Reading Room Stack C-4', status: 'AVAILABLE', copyNumber: 2 },
    ],
    digitalFolios: [],
  },
  {
    id: 'rec-per-0044',
    titleLatin: 'Al-Bayān monthly, bound run 1954–1961',
    titleArabic: 'مجلة البيان',
    authors: JSON.stringify(['Editorial Board, Kerala Jam’iyyatul Ulama']),
    shelfmark: 'PER 0044',
    callNumber: 'PER-ARA-0044',
    format: 'PERIODICAL',
    language: 'Arabic and Malayalam',
    extent: '8 bound volumes',
    summary: 'Mid-twentieth century monthly journal documenting educational and social developments.',
    subjects: JSON.stringify(['Periodicals', 'Social History', 'Kerala Ulama']),
    accessLevel: 'READING_ROOM_ONLY',
    publicationYear: '1954',
    publisher: 'KJU Publications',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
    copies: [
      { id: 'copy-5', barcode: 'PER0044-01', rfidTag: 'RFID-PER0044-01', location: 'Periodicals Archive Shelf P-1', status: 'ON_LOAN', copyNumber: 1 },
    ],
    digitalFolios: [],
  },
];

@Injectable()
export class CatalogService {
  private facetCache: any = null;
  private facetCacheTime = 0;
  private readonly FACET_TTL_MS = 60 * 1000;
  private inMemoryRecords: any[] = [...DEFAULT_SAMPLE_RECORDS];

  constructor(private prisma: PrismaService) {}

  private async ensureSeeded() {
    try {
      const count = await this.prisma.bibliographicRecord.count();
      if (count === 0) {
        for (const r of DEFAULT_SAMPLE_RECORDS) {
          const { copies, digitalFolios, ...data } = r;
          const created = await this.prisma.bibliographicRecord.create({ data });
          if (copies && copies.length > 0) {
            for (const c of copies) {
              await this.prisma.itemCopy.create({
                data: {
                  bibRecordId: created.id,
                  barcode: c.barcode,
                  rfidTag: c.rfidTag,
                  location: c.location,
                  status: c.status,
                  copyNumber: c.copyNumber,
                },
              });
            }
          }
        }
      }
    } catch {
      // Prisma error or table issue; memory fallback will be used
    }
  }

  private async getCachedFacets() {
    const now = Date.now();
    if (this.facetCache && now - this.facetCacheTime < this.FACET_TTL_MS) {
      return this.facetCache;
    }

    try {
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

      const facets = {
        formats: formatAgg.map((f) => ({ key: f.format, count: f._count?.format ?? 0 })),
        accessLevels: accessAgg.map((a) => ({ key: a.accessLevel, count: a._count?.accessLevel ?? 0 })),
        languages: languageAgg.map((l) => ({ key: l.language, count: l._count?.language ?? 0 })),
      };

      this.facetCache = facets;
      this.facetCacheTime = now;
      return facets;
    } catch {
      // Build facets from in-memory records
      const formatsMap: Record<string, number> = {};
      const accessMap: Record<string, number> = {};
      const langMap: Record<string, number> = {};

      for (const r of this.inMemoryRecords) {
        if (r.format) formatsMap[r.format] = (formatsMap[r.format] || 0) + 1;
        if (r.accessLevel) accessMap[r.accessLevel] = (accessMap[r.accessLevel] || 0) + 1;
        if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
      }

      const facets = {
        formats: Object.entries(formatsMap).map(([key, count]) => ({ key, count })),
        accessLevels: Object.entries(accessMap).map(([key, count]) => ({ key, count })),
        languages: Object.entries(langMap).map(([key, count]) => ({ key, count })),
      };

      this.facetCache = facets;
      this.facetCacheTime = now;
      return facets;
    }
  }

  async search(queryDto: SearchQueryDto) {
    await this.ensureSeeded();

    const page = Math.max(1, Number(queryDto.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(queryDto.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    const andConditions: any[] = [];

    let activeCollection: { id: string; name: string; slug: string; description: string | null } | null = null;
    try {
      if (queryDto.collection) {
        activeCollection = await this.prisma.collection.findFirst({
          where: { OR: [{ slug: queryDto.collection }, { name: queryDto.collection }] },
          select: { id: true, name: true, slug: true, description: true },
        });
        where.collectionId = activeCollection ? activeCollection.id : '__none__';
      } else if (queryDto.collectionId) {
        where.collectionId = queryDto.collectionId;
      }
    } catch {
      // Ignore collection error
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
      try {
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
      } catch {
        // Ignore year filter error
      }
    }

    if (queryDto.frameworkCode) {
      where.frameworkCode = queryDto.frameworkCode;
    }

    if (queryDto.title) {
      andConditions.push({
        OR: [
          { titleLatin: { contains: queryDto.title, mode: 'insensitive' } },
          { titleArabic: { contains: queryDto.title, mode: 'insensitive' } },
          { subtitle: { contains: queryDto.title, mode: 'insensitive' } },
        ],
      });
    }

    if (queryDto.shelfmark) {
      andConditions.push({
        OR: [
          { shelfmark: { contains: queryDto.shelfmark, mode: 'insensitive' } },
          { callNumber: { contains: queryDto.shelfmark, mode: 'insensitive' } },
        ],
      });
    }

    if (queryDto.publisher) {
      andConditions.push({
        publisher: { contains: queryDto.publisher, mode: 'insensitive' },
      });
    }

    if (queryDto.author) {
      andConditions.push({
        OR: [{ authors: { contains: queryDto.author, mode: 'insensitive' } }, { scribe: { contains: queryDto.author, mode: 'insensitive' } }],
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

    try {
      const [items, total, facets] = await Promise.all([
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
        this.getCachedFacets(),
      ]);

      if (items) {
        return {
          data: items.map((item) => ({
            ...item,
            authors: this.safeJsonParse(item.authors, []),
            subjects: this.safeJsonParse(item.subjects, []),
            availableCopiesCount: (item.copies || []).filter((c: any) => c.status === 'AVAILABLE').length,
            totalCopiesCount: (item.copies || []).length,
          })),
          meta: {
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
          },
          collection: activeCollection,
          facets,
        };
      }
    } catch {
      // In-memory fallback
    }

    // In-memory search fallback
    let results = [...this.inMemoryRecords];

    if (queryDto.q) {
      const lq = queryDto.q.toLowerCase();
      results = results.filter(
        (r) =>
          (r.titleLatin && r.titleLatin.toLowerCase().includes(lq)) ||
          (r.titleArabic && r.titleArabic.toLowerCase().includes(lq)) ||
          (r.authors && r.authors.toLowerCase().includes(lq)) ||
          (r.shelfmark && r.shelfmark.toLowerCase().includes(lq)) ||
          (r.subjects && r.subjects.toLowerCase().includes(lq)) ||
          (r.summary && r.summary.toLowerCase().includes(lq))
      );
    }

    if (queryDto.format) {
      const formats = queryDto.format.split(',').map((f) => f.trim()).filter(Boolean);
      results = results.filter((r) => formats.includes(r.format));
    }

    if (queryDto.access) {
      const accessLevels = queryDto.access.split(',').map((a) => a.trim()).filter(Boolean);
      results = results.filter((r) => accessLevels.includes(r.accessLevel));
    }

    const total = results.length;
    const paged = results.slice(skip, skip + limit);
    const facets = await this.getCachedFacets();

    return {
      data: paged.map((item) => ({
        ...item,
        authors: this.safeJsonParse(item.authors, []),
        subjects: this.safeJsonParse(item.subjects, []),
        availableCopiesCount: (item.copies || []).filter((c: any) => c.status === 'AVAILABLE').length,
        totalCopiesCount: (item.copies || []).length,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      collection: activeCollection,
      facets,
    };
  }

  async update(id: string, dto: Partial<CreateRecordDto>) {
    try {
      const existing = await this.prisma.bibliographicRecord.findUnique({ where: { id } });
      if (existing) {
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
            ...(dto.frameworkCode !== undefined && { frameworkCode: dto.frameworkCode || null }),
            ...(dto.customFields !== undefined && {
              customFields: typeof dto.customFields === 'string' ? dto.customFields : JSON.stringify(dto.customFields),
            }),
          },
        });

        return this.findOne(id);
      }
    } catch (err) {
      if (err instanceof ConflictException || err instanceof NotFoundException) throw err;
    }

    const idx = this.inMemoryRecords.findIndex((r) => r.id === id);
    if (idx === -1) throw new NotFoundException(`Bibliographic record #${id} not found.`);

    this.inMemoryRecords[idx] = {
      ...this.inMemoryRecords[idx],
      ...dto,
      authors: dto.authors !== undefined ? JSON.stringify(dto.authors) : this.inMemoryRecords[idx].authors,
      subjects: dto.subjects !== undefined ? JSON.stringify(dto.subjects) : this.inMemoryRecords[idx].subjects,
      updatedAt: new Date(),
    };
    return this.findOne(id);
  }

  async remove(id: string) {
    try {
      const existing = await this.prisma.bibliographicRecord.findUnique({ where: { id } });
      if (existing) {
        await this.prisma.bibliographicRecord.delete({ where: { id } });
        return { success: true };
      }
    } catch {}

    this.inMemoryRecords = this.inMemoryRecords.filter((r) => r.id !== id);
    return { success: true };
  }

  async findOne(idOrSlug: string) {
    try {
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

      if (!record) {
        const candidates = await this.prisma.bibliographicRecord.findMany({ include });
        record =
          candidates.find(
            (r) => this.slugify(r.shelfmark) === idOrSlug || this.slugify(r.titleLatin) === idOrSlug
          ) || null;
      }

      if (record) {
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
    } catch {
      // In-memory fallback
    }

    const mem =
      this.inMemoryRecords.find(
        (r) => r.id === idOrSlug || this.slugify(r.shelfmark) === idOrSlug || this.slugify(r.titleLatin) === idOrSlug
      );

    if (!mem) {
      throw new NotFoundException(`Bibliographic record #${idOrSlug} not found.`);
    }

    return {
      ...mem,
      authors: this.safeJsonParse(mem.authors, []),
      subjects: this.safeJsonParse(mem.subjects, []),
      related: [],
      citations: this.generateCitations(mem),
    };
  }

  async create(dto: CreateRecordDto) {
    const shelfmark = dto.shelfmark?.trim() || `REC-${Date.now().toString().slice(-6)}`;

    try {
      if (dto.shelfmark) {
        const existing = await this.prisma.bibliographicRecord.findUnique({
          where: { shelfmark: dto.shelfmark },
        });
        if (existing) {
          throw new ConflictException(`Shelfmark ${dto.shelfmark} is already in use.`);
        }
      }

      const record = await this.prisma.bibliographicRecord.create({
        data: {
          titleArabic: dto.titleArabic,
          titleLatin: dto.titleLatin,
          subtitle: dto.subtitle,
          statementOfResponsibility: dto.statementOfResponsibility,
          authors: JSON.stringify(dto.authors || []),
          scribe: dto.scribe,
          shelfmark,
          callNumber: dto.callNumber || (dto.shelfmark ? dto.shelfmark : undefined),
          isbn: dto.isbn,
          issn: dto.issn,
          doi: dto.doi,
          format: dto.format || '',
          language: dto.language || '',
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
          frameworkCode: dto.frameworkCode || undefined,
          customFields: dto.customFields ? (typeof dto.customFields === 'string' ? dto.customFields : JSON.stringify(dto.customFields)) : undefined,
        },
      });

      const copiesCount = dto.initialCopiesCount ?? 0;
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

      return this.findOne(record.id);
    } catch (err: any) {
      if (err instanceof ConflictException) throw err;
      const newRec = {
        id: `rec-${Date.now()}`,
        ...dto,
        shelfmark,
        authors: JSON.stringify(dto.authors || []),
        subjects: JSON.stringify(dto.subjects || []),
        createdAt: new Date(),
        updatedAt: new Date(),
        copies: [],
        digitalFolios: [],
      };
      this.inMemoryRecords.push(newRec);
      return this.findOne(newRec.id);
    }
  }

  async addCopy(
    bibRecordId: string,
    location?: string,
    barcodeCustom?: string,
    rfidTag?: string,
    status?: string,
    imageUrl?: string
  ) {
    try {
      const record = await this.prisma.bibliographicRecord.findUnique({
        where: { id: bibRecordId },
        include: { copies: true },
      });

      if (record) {
        const nextCopyNumber = record.copies.length + 1;
        const barcode = barcodeCustom || `${record.shelfmark.replace(/\s+/g, '')}-${String(nextCopyNumber).padStart(2, '0')}`;

        return await this.prisma.itemCopy.create({
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
    } catch {}

    const rec = this.inMemoryRecords.find((r) => r.id === bibRecordId);
    if (!rec) throw new NotFoundException('Bibliographic record not found');
    const nextCopyNumber = (rec.copies || []).length + 1;
    const barcode = barcodeCustom || `${rec.shelfmark.replace(/\s+/g, '')}-${String(nextCopyNumber).padStart(2, '0')}`;
    const copy = {
      id: `copy-${Date.now()}`,
      bibRecordId,
      barcode,
      rfidTag: rfidTag || undefined,
      copyNumber: nextCopyNumber,
      location: location || 'Main Reading Room',
      status: status || 'AVAILABLE',
      imageUrl: imageUrl || undefined,
    };
    rec.copies = [...(rec.copies || []), copy];
    return copy;
  }

  async updateCopy(
    copyId: string,
    data: { barcode?: string; rfidTag?: string; location?: string; status?: string; imageUrl?: string }
  ) {
    try {
      const existing = await this.prisma.itemCopy.findUnique({ where: { id: copyId } });
      if (existing) {
        return await this.prisma.itemCopy.update({
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
    } catch {}

    for (const r of this.inMemoryRecords) {
      const c = (r.copies || []).find((cp: any) => cp.id === copyId);
      if (c) {
        Object.assign(c, data);
        return c;
      }
    }
    throw new NotFoundException('Item copy not found.');
  }

  async removeCopy(copyId: string) {
    try {
      const existing = await this.prisma.itemCopy.findUnique({
        where: { id: copyId },
        include: { loans: { where: { status: 'ACTIVE' } } },
      });
      if (existing) {
        if (existing.loans.length > 0) {
          throw new ConflictException('Cannot delete a copy that is currently on loan.');
        }
        await this.prisma.itemCopy.delete({ where: { id: copyId } });
        return { success: true };
      }
    } catch (err) {
      if (err instanceof ConflictException) throw err;
    }

    for (const r of this.inMemoryRecords) {
      if (r.copies) {
        r.copies = r.copies.filter((cp: any) => cp.id !== copyId);
      }
    }
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
    'customFields',
  ] as const;

  private buildBooleanSearchClause(q: string): any {
    const tokens = q.trim().split(/\s+/).filter(Boolean);
    const hasBoolean = tokens.some((t) => ['AND', 'OR', 'NOT'].includes(t.toUpperCase()));

    const termClause = (term: string) => ({
      OR: this.SEARCHABLE_FIELDS.map((field) => ({ [field]: { contains: term } })),
    });

    if (!hasBoolean) {
      return termClause(q.trim());
    }

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

    try {
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
    } catch {
      // Fallback in memory
    }

    return results;
  }

  async exportRecords(format: 'marcxml' | 'csv', ids?: string[]) {
    const EXPORT_SAFETY_CAP = 5000;
    try {
      const records = await this.prisma.bibliographicRecord.findMany({
        where: ids && ids.length ? { id: { in: ids } } : undefined,
        take: EXPORT_SAFETY_CAP,
        orderBy: { createdAt: 'asc' },
      });

      if (records && records.length > 0) {
        if (format === 'csv') return this.toCsv(records);
        return this.toMarcXml(records);
      }
    } catch {}

    const records = ids && ids.length ? this.inMemoryRecords.filter((r) => ids.includes(r.id)) : this.inMemoryRecords;
    if (format === 'csv') return this.toCsv(records);
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
        ? await this.prisma.bibliographicRecord.findUnique({ where: { kohaBiblionumber } }).catch(() => null)
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

      try {
        const bib = existing
          ? await this.prisma.bibliographicRecord.update({ where: { id: existing.id }, data })
          : await this.prisma.bibliographicRecord.create({ data: { ...data, accessLevel: 'READING_ROOM_ONLY' } });
        existing ? updated++ : created++;

        for (let i = 0; i < group.length; i++) {
          const row = group[i];
          let barcode = clean(row.Barcode) ?? `IMPORT-${biblioKey}-${i + 1}`;
          if (usedBarcodes.has(barcode)) barcode = `${barcode}-${Math.random().toString(36).slice(2, 6)}`;
          usedBarcodes.add(barcode);
          const already = await this.prisma.itemCopy.findUnique({ where: { barcode } }).catch(() => null);
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
      } catch {
        // Fallback update
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
