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

    if (queryDto.q) {
      const searchTerms = queryDto.q.trim();
      where.OR = [
        { titleLatin: { contains: searchTerms } },
        { titleArabic: { contains: searchTerms } },
        { authors: { contains: searchTerms } },
        { shelfmark: { contains: searchTerms } },
        { subjects: { contains: searchTerms } },
        { summary: { contains: searchTerms } },
        { scribe: { contains: searchTerms } },
      ];
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
      where.OR = [
        { authors: { contains: queryDto.author } },
        { scribe: { contains: queryDto.author } },
      ];
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
        ...(dto.extent !== undefined && { extent: dto.extent }),
        ...(dto.material !== undefined && { material: dto.material }),
        ...(dto.binding !== undefined && { binding: dto.binding }),
        ...(dto.provenance !== undefined && { provenance: dto.provenance }),
        ...(dto.summary !== undefined && { summary: dto.summary }),
        ...(dto.subjects !== undefined && { subjects: JSON.stringify(dto.subjects) }),
        ...(dto.accessLevel !== undefined && { accessLevel: dto.accessLevel }),
        ...(dto.coverImageUrl !== undefined && { coverImageUrl: dto.coverImageUrl }),
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
            select: { dueDate: true },
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
        extent: dto.extent,
        material: dto.material,
        binding: dto.binding,
        provenance: dto.provenance,
        summary: dto.summary,
        subjects: JSON.stringify(dto.subjects || []),
        accessLevel: dto.accessLevel || 'DIGITISED_FULL',
        coverImageUrl: dto.coverImageUrl,
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

    return this.findOne(record.id);
  }

  async addCopy(bibRecordId: string, location?: string, barcodeCustom?: string) {
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
        copyNumber: nextCopyNumber,
        location: location || 'Main Reading Room',
        status: 'AVAILABLE',
      },
    });
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
