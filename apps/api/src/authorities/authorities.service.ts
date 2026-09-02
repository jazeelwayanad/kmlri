import { Injectable, NotFoundException, ConflictException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorityDto } from './dto/create-authority.dto';
import { LinkHeadingDto } from './dto/link-heading.dto';

@Injectable()
export class AuthoritiesService {
  constructor(private prisma: PrismaService) {}

  async search(q?: string, headingType?: string) {
    const where: any = {};
    if (q) {
      where.heading = { contains: q };
    }
    if (headingType) {
      where.headingType = headingType;
    }
    return this.prisma.authorityRecord.findMany({
      where,
      orderBy: { heading: 'asc' },
      include: { _count: { select: { headings: true } } },
      take: 200,
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.authorityRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Authority record not found.');
    return record;
  }

  async create(dto: CreateAuthorityDto) {
    if (!dto.heading?.trim()) throw new BadRequestException('heading is required.');

    if (!dto.force) {
      // Prevent unnecessary duplication of controlled headings: case-insensitive
      // exact match on (headingType, heading).
      const existing = await this.prisma.authorityRecord.findFirst({
        where: {
          headingType: dto.headingType,
          heading: { equals: dto.heading.trim(), mode: 'insensitive' },
        },
      });
      if (existing) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'A possible duplicate authority record already exists for this heading. Pass force: true to create anyway.',
            possibleDuplicate: existing,
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    const { force, ...data } = dto;
    return this.prisma.authorityRecord.create({
      data: {
        ...data,
        heading: dto.heading.trim(),
        seeAlso: JSON.stringify(dto.seeAlso || []),
      },
    });
  }

  async update(id: string, data: Partial<Omit<CreateAuthorityDto, 'force'>>) {
    const existing = await this.prisma.authorityRecord.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Authority record not found.');

    const updateData: any = { ...data };
    if (data.seeAlso) updateData.seeAlso = JSON.stringify(data.seeAlso);

    return this.prisma.authorityRecord.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    const existing = await this.prisma.authorityRecord.findUnique({
      where: { id },
      include: { headings: { include: { bibRecord: { select: { id: true, titleLatin: true, shelfmark: true } } } } },
    });
    if (!existing) throw new NotFoundException('Authority record not found.');

    if (existing.headings.length > 0) {
      const linked = existing.headings.map((h) => `${h.bibRecord.titleLatin} (${h.bibRecord.shelfmark})`);
      throw new ConflictException(
        `This authority record is linked to ${existing.headings.length} bibliographic record(s) and cannot be deleted: ${linked.join(', ')}`,
      );
    }

    await this.prisma.authorityRecord.delete({ where: { id } });
    return { success: true };
  }

  async usage(id: string) {
    const existing = await this.prisma.authorityRecord.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Authority record not found.');

    const headings = await this.prisma.bibliographicHeading.findMany({
      where: { authorityId: id },
      include: { bibRecord: { select: { id: true, titleLatin: true, titleArabic: true, shelfmark: true } } },
    });

    return headings.map((h) => ({
      headingId: h.id,
      tag: h.tag,
      subfield: h.subfield,
      bibRecord: h.bibRecord,
    }));
  }

  async link(dto: LinkHeadingDto) {
    const [bibRecord, authority] = await Promise.all([
      this.prisma.bibliographicRecord.findUnique({ where: { id: dto.bibRecordId } }),
      this.prisma.authorityRecord.findUnique({ where: { id: dto.authorityId } }),
    ]);
    if (!bibRecord) throw new NotFoundException('Bibliographic record not found.');
    if (!authority) throw new NotFoundException('Authority record not found.');

    // Idempotent: if the link already exists, just return it.
    try {
      return await this.prisma.bibliographicHeading.upsert({
        where: {
          bibRecordId_authorityId_tag: {
            bibRecordId: dto.bibRecordId,
            authorityId: dto.authorityId,
            tag: dto.tag,
          },
        },
        update: { subfield: dto.subfield ?? 'a' },
        create: {
          bibRecordId: dto.bibRecordId,
          authorityId: dto.authorityId,
          tag: dto.tag,
          subfield: dto.subfield ?? 'a',
        },
      });
    } catch (err: any) {
      // Fall back gracefully on a unique constraint race.
      if (err?.code === 'P2002') {
        const existing = await this.prisma.bibliographicHeading.findFirst({
          where: { bibRecordId: dto.bibRecordId, authorityId: dto.authorityId, tag: dto.tag },
        });
        if (existing) return existing;
      }
      throw err;
    }
  }

  async unlink(id: string) {
    const existing = await this.prisma.bibliographicHeading.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Heading link not found.');
    await this.prisma.bibliographicHeading.delete({ where: { id } });
    return { success: true };
  }
}
