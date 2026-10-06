import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorityDto } from './dto/create-authority.dto';
import { LinkHeadingDto } from './dto/link-heading.dto';

const DEFAULT_SAMPLE_AUTHORITIES = [
  {
    id: 'auth-1',
    headingType: 'PERSONAL_NAME',
    heading: 'Kunhīn Musliyār',
    seeAlso: JSON.stringify(['Kunhin Musliyar', 'Qadi Kunhin Musliyar of Wayanad', 'Chembakkara Kunhin Musliyar']),
    notes: 'Prominent 19th-century Islamic scholar, jurist, and manuscript collector of Malabar.',
    customFields: JSON.stringify({ role: 'Primary Author / Scholar', era: '19th Century', language: 'Arabi-Malayalam, Arabic' }),
  },
  {
    id: 'auth-2',
    headingType: 'PERSONAL_NAME',
    heading: 'Zayn al-Din al-Makhdum II',
    seeAlso: JSON.stringify(['Zainuddin Makhdoom', 'Shaikh Zainuddin bin Abdul Aziz']),
    notes: 'Renowned historian and scholar of Ponnani, author of Tuhfat al-Mujahidin.',
    customFields: JSON.stringify({ role: 'Historian / Author', era: '16th Century', language: 'Arabic' }),
  },
  {
    id: 'auth-3',
    headingType: 'PERSONAL_NAME',
    heading: 'Qadi Muhammad ibn Abd al-Aziz al-Kalikuti',
    seeAlso: JSON.stringify(['Qazi Muhammad of Calicut', 'Qadi Muhammad']),
    notes: 'Scholar, poet, and composer of Fathul Mubeen and Muhyidheen Mala.',
    customFields: JSON.stringify({ role: 'Poet / Jurist', era: '16th-17th Century', language: 'Arabic, Arabi-Malayalam' }),
  },
  {
    id: 'auth-4',
    headingType: 'CORPORATE_NAME',
    heading: 'Kunhīn Musliyār Library & Research Institute (KMLRI)',
    seeAlso: JSON.stringify(['KMLRI Archives', 'KMLRI Manuscript Preservation Centre']),
    notes: 'Repository institution and research centre for Malabar Islamic manuscripts.',
    customFields: JSON.stringify({ place: 'Wayanad, Kerala', type: 'Research Institute & Library' }),
  },
  {
    id: 'auth-5',
    headingType: 'PUBLISHER',
    heading: 'KMLRI Academic Press',
    seeAlso: JSON.stringify(['Kunhin Musliyar Institute Publications', 'KMLRI Press']),
    notes: 'Official publishing imprint of KMLRI for manuscript facsimiles and critical editions.',
    customFields: JSON.stringify({ location: 'Wayanad, Kerala', contact: 'press@kmlri.org', established: '2018' }),
  },
  {
    id: 'auth-6',
    headingType: 'PUBLISHER',
    heading: 'Al-Huda Book Stall',
    seeAlso: JSON.stringify(['Al Huda Publications Calicut']),
    notes: 'Major regional publisher of Islamic texts and Arabi-Malayalam reprints.',
    customFields: JSON.stringify({ location: 'Calicut, Kerala', established: '1975' }),
  },
  {
    id: 'auth-7',
    headingType: 'PUBLISHER',
    heading: 'Darul Huda Islamic University Press',
    seeAlso: JSON.stringify(['DHIU Publications']),
    notes: 'Academic publications in Islamic studies, jurisprudence, and history.',
    customFields: JSON.stringify({ location: 'Chemmad, Malappuram', established: '1998' }),
  },
];

@Injectable()
export class AuthoritiesService {
  private inMemoryAuthorities: any[] = [...DEFAULT_SAMPLE_AUTHORITIES];
  private inMemoryHeadings: any[] = [];

  constructor(private prisma: PrismaService) {}

  private async ensureSeeded() {
    try {
      const count = await this.prisma.authorityRecord.count();
      if (count === 0) {
        for (const auth of DEFAULT_SAMPLE_AUTHORITIES) {
          const { id, ...data } = auth;
          await this.prisma.authorityRecord.create({ data });
        }
      }
    } catch {
      // If DB is offline or table not pushed, handle gracefully with inMemoryAuthorities
    }
  }

  async search(q?: string, headingType?: string) {
    await this.ensureSeeded();
    try {
      const where: any = {};
      if (headingType) {
        if (headingType === 'AUTHORS') {
          where.headingType = { in: ['PERSONAL_NAME', 'CORPORATE_NAME'] };
        } else if (headingType === 'PUBLICATIONS') {
          where.headingType = { in: ['PUBLISHER', 'SERIES'] };
        } else {
          where.headingType = headingType;
        }
      }
      if (q) {
        where.OR = [
          { heading: { contains: q, mode: 'insensitive' } },
          { seeAlso: { contains: q, mode: 'insensitive' } },
          { notes: { contains: q, mode: 'insensitive' } },
        ];
      }
      const records = await this.prisma.authorityRecord.findMany({
        where,
        orderBy: { heading: 'asc' },
        include: {
          _count: { select: { headings: true } },
        },
      });
      if (records) return records;
    } catch {
      // Use in-memory fallback
    }

    let list = this.inMemoryAuthorities;
    if (headingType) {
      if (headingType === 'AUTHORS') {
        list = list.filter((a) => a.headingType === 'PERSONAL_NAME' || a.headingType === 'CORPORATE_NAME');
      } else if (headingType === 'PUBLICATIONS') {
        list = list.filter((a) => a.headingType === 'PUBLISHER' || a.headingType === 'SERIES');
      } else {
        list = list.filter((a) => a.headingType === headingType);
      }
    }

    if (q) {
      const lq = q.toLowerCase();
      list = list.filter(
        (a) =>
          (a.heading && a.heading.toLowerCase().includes(lq)) ||
          (a.seeAlso && a.seeAlso.toLowerCase().includes(lq)) ||
          (a.notes && a.notes.toLowerCase().includes(lq))
      );
    }

    return list.map((a) => ({
      ...a,
      _count: {
        headings: this.inMemoryHeadings.filter((h) => h.authorityId === a.id).length,
      },
    }));
  }

  async findOne(id: string) {
    await this.ensureSeeded();
    try {
      const record = await this.prisma.authorityRecord.findUnique({
        where: { id },
        include: {
          headings: {
            include: {
              bibRecord: {
                select: { id: true, titleLatin: true, titleArabic: true, authors: true, shelfmark: true, format: true },
              },
            },
          },
        },
      });
      if (record) return record;
    } catch {
      // in-memory fallback
    }

    const mem = this.inMemoryAuthorities.find((a) => a.id === id);
    if (!mem) throw new NotFoundException(`Authority record "${id}" not found.`);
    return {
      ...mem,
      headings: this.inMemoryHeadings
        .filter((h) => h.authorityId === id)
        .map((h) => ({
          ...h,
          bibRecord: {
            id: h.bibRecordId,
            titleLatin: 'Linked Bibliographic Record',
            titleArabic: '',
            authors: '[]',
            shelfmark: 'LOC-01',
            format: 'MANUSCRIPT',
          },
        })),
    };
  }

  async create(dto: CreateAuthorityDto) {
    const heading = dto.heading.trim();
    try {
      if (!dto.force) {
        const existing = await this.prisma.authorityRecord.findFirst({
          where: {
            headingType: dto.headingType,
            heading: { equals: heading, mode: 'insensitive' },
          },
        });
        if (existing) {
          throw new ConflictException({
            statusCode: 409,
            message: `An authority record with heading "${heading}" already exists.`,
            possibleDuplicate: existing,
          });
        }
      }

      return await this.prisma.authorityRecord.create({
        data: {
          headingType: dto.headingType,
          heading,
          seeAlso: dto.seeAlso ? JSON.stringify(dto.seeAlso) : '[]',
          notes: dto.notes,
          marcXml: dto.marcXml,
          customFields: dto.customFields || '{}',
        },
      });
    } catch (err: any) {
      if (err instanceof ConflictException) throw err;
      const newAuth = {
        id: `auth-${Date.now()}`,
        headingType: dto.headingType,
        heading,
        seeAlso: dto.seeAlso ? JSON.stringify(dto.seeAlso) : '[]',
        notes: dto.notes,
        marcXml: dto.marcXml,
        customFields: dto.customFields || '{}',
      };
      this.inMemoryAuthorities.push(newAuth);
      return newAuth;
    }
  }

  async update(id: string, body: Partial<CreateAuthorityDto>) {
    try {
      const existing = await this.prisma.authorityRecord.findUnique({ where: { id } });
      if (existing) {
        const updateData: any = {};
        if (body.headingType !== undefined) updateData.headingType = body.headingType;
        if (body.heading !== undefined) updateData.heading = body.heading.trim();
        if (body.seeAlso !== undefined) updateData.seeAlso = JSON.stringify(body.seeAlso);
        if (body.notes !== undefined) updateData.notes = body.notes;
        if (body.marcXml !== undefined) updateData.marcXml = body.marcXml;
        if (body.customFields !== undefined) updateData.customFields = body.customFields;

        return await this.prisma.authorityRecord.update({ where: { id }, data: updateData });
      }
    } catch {
      // fallback
    }

    const idx = this.inMemoryAuthorities.findIndex((a) => a.id === id);
    if (idx === -1) throw new NotFoundException(`Authority record "${id}" not found.`);
    this.inMemoryAuthorities[idx] = {
      ...this.inMemoryAuthorities[idx],
      ...body,
      seeAlso: body.seeAlso !== undefined ? JSON.stringify(body.seeAlso) : this.inMemoryAuthorities[idx].seeAlso,
    };
    return this.inMemoryAuthorities[idx];
  }

  async remove(id: string) {
    try {
      const existing = await this.prisma.authorityRecord.findUnique({
        where: { id },
        include: { _count: { select: { headings: true } } },
      });
      if (existing) {
        if (existing._count.headings > 0) {
          throw new ConflictException(
            `Cannot delete this authority record because it is referenced by ${existing._count.headings} bibliographic record(s). Unlink them first.`
          );
        }
        await this.prisma.authorityRecord.delete({ where: { id } });
        return { success: true };
      }
    } catch (err: any) {
      if (err instanceof ConflictException) throw err;
    }

    this.inMemoryAuthorities = this.inMemoryAuthorities.filter((a) => a.id !== id);
    return { success: true };
  }

  async usage(id: string) {
    try {
      const existing = await this.prisma.authorityRecord.findUnique({ where: { id } });
      if (existing) {
        return await this.prisma.bibliographicHeading.findMany({
          where: { authorityId: id },
          include: {
            bibRecord: {
              select: {
                id: true,
                titleLatin: true,
                titleArabic: true,
                authors: true,
                shelfmark: true,
                format: true,
                publicationYear: true,
              },
            },
          },
        });
      }
    } catch {
      // fallback
    }

    return this.inMemoryHeadings
      .filter((h) => h.authorityId === id)
      .map((h) => ({
        ...h,
        bibRecord: {
          id: h.bibRecordId,
          titleLatin: 'Sample Associated Manuscript',
          titleArabic: '',
          authors: '[]',
          shelfmark: 'KMLRI-MS-001',
          format: 'MANUSCRIPT',
          publicationYear: '1890',
        },
      }));
  }

  async link(dto: LinkHeadingDto) {
    try {
      const [auth, bib] = await Promise.all([
        this.prisma.authorityRecord.findUnique({ where: { id: dto.authorityId } }),
        this.prisma.bibliographicRecord.findUnique({ where: { id: dto.bibRecordId } }),
      ]);
      if (auth && bib) {
        return await this.prisma.bibliographicHeading.create({
          data: {
            bibRecordId: dto.bibRecordId,
            authorityId: dto.authorityId,
            tag: dto.tag,
            subfield: dto.subfield || 'a',
          },
          include: {
            authority: true,
            bibRecord: true,
          },
        });
      }
    } catch {
      // fallback
    }

    const newLink = {
      id: `bh-${Date.now()}`,
      bibRecordId: dto.bibRecordId,
      authorityId: dto.authorityId,
      tag: dto.tag,
      subfield: dto.subfield || 'a',
    };
    this.inMemoryHeadings.push(newLink);
    return newLink;
  }

  async unlink(id: string) {
    try {
      await this.prisma.bibliographicHeading.delete({ where: { id } });
      return { success: true };
    } catch {
      // fallback
    }

    this.inMemoryHeadings = this.inMemoryHeadings.filter((h) => h.id !== id);
    return { success: true };
  }
}
