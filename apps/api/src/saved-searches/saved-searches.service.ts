import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedSearchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const searches = await this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return searches.map((s) => ({
      ...s,
      filters: (() => {
        try {
          return s.filters ? JSON.parse(s.filters) : {};
        } catch {
          return {};
        }
      })(),
    }));
  }

  async create(userId: string, query: string, filters?: Record<string, any>) {
    if (!query?.trim()) throw new BadRequestException('query is required.');
    return this.prisma.savedSearch.create({
      data: {
        userId,
        query: query.trim(),
        filters: filters ? JSON.stringify(filters) : null,
      },
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.savedSearch.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Saved search not found.');
    if (existing.userId !== userId) throw new BadRequestException('You do not own this saved search.');
    await this.prisma.savedSearch.delete({ where: { id } });
    return { success: true };
  }
}
