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
      where.format = queryDto.format;
    }

    if (queryDto.access) {
      where.accessLevel = queryDto.access;
    }

    if (queryDto.author) {
      where.OR = [
        { authors: { contains: queryDto.author } },
        { scribe: { contains: queryDto.author } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.bibliographicRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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

    // Facet aggregation summaries
    const [formatAgg, accessAgg] = await Promise.all([
      this.prisma.bibliographicRecord.groupBy({
        by: ['format'],
        _count: { format: true },
      }),
      this.prisma.bibliographicRecord.groupBy({
        by: ['accessLevel'],
        _count: { accessLevel: true },
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
      },
    };
  }

  async findOne(id: string) {
    const record = await this.prisma.bibliographicRecord.findUnique({
      where: { id },
      include: {
        copies: {
          include: {
            loans: {
              where: { status: 'ACTIVE' },
              select: { dueDate: true },
            },
          },
        },
        digitalFolios: {
          orderBy: { folioNumber: 'asc' },
        },
      },
    });

    if (!record) {
      throw new NotFoundException(`Bibliographic record #${id} not found.`);
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

  private safeJsonParse(val: string, fallback: any) {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
}
