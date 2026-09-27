import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function parseTagsSafely(tags: string | null | undefined): string[] {
  if (!tags) return [];
  try {
    const parsed = JSON.parse(tags);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === 'string') return [parsed];
    return [];
  } catch {
    return tags.split(',').map((t) => t.trim()).filter(Boolean);
  }
}

@Injectable()
export class ContentService {
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly CACHE_TTL_MS = 30 * 1000;

  constructor(private prisma: PrismaService) {}

  invalidateCache() {
    this.cache.clear();
  }

  async findAll(query?: { category?: string; featured?: boolean; search?: string; limit?: number; page?: number }) {
    const cacheKey = JSON.stringify(query || {});
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    const where: any = {};

    if (query?.category && query.category !== 'ALL') {
      const catMap: Record<string, string> = {
        EVENTS: 'EVENT',
        EVENT: 'EVENT',
        NEWS: 'NEWS',
        STORIES: 'STORY',
        STORY: 'STORY',
        OPPORTUNITIES: 'OPPORTUNITY',
        OPPORTUNITY: 'OPPORTUNITY',
      };
      const catUpper = query.category.toUpperCase();
      where.category = catMap[catUpper] || catUpper;
    }

    if (query?.featured !== undefined) {
      where.featured = query.featured;
    }

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
        { kicker: { contains: query.search, mode: 'insensitive' } },
        { venue: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const take = query?.limit ? Number(query.limit) : 50;
    const page = query?.page ? Number(query.page) : 1;
    const skip = (page - 1) * take;

    const [items, total] = await Promise.all([
      this.prisma.contentItem.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        take,
        skip,
      }),
      this.prisma.contentItem.count({ where }),
    ]);

    const result = {
      items: items.map((item) => ({
        ...item,
        tags: parseTagsSafely(item.tags),
      })),
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    };

    this.cache.set(cacheKey, {
      data: result,
      expiry: Date.now() + this.CACHE_TTL_MS,
    });

    return result;
  }

  async findOne(idOrSlug: string) {
    const item = await this.prisma.contentItem.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!item) {
      throw new NotFoundException(`Content item with ID or slug "${idOrSlug}" not found`);
    }

    return {
      ...item,
      tags: parseTagsSafely(item.tags),
    };
  }

  async create(data: {
    title: string;
    category: string;
    slug?: string;
    kicker?: string;
    summary: string;
    content?: string;
    date?: string;
    time?: string;
    venue?: string;
    capacity?: number;
    deadline?: string;
    stipend?: string;
    author?: string;
    imageUrl?: string;
    featured?: boolean;
    tags?: string[];
  }) {
    this.invalidateCache();
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + `-${Date.now()}`;

    const tags = data.tags ? JSON.stringify(data.tags) : '[]';

    return this.prisma.contentItem.create({
      data: {
        ...data,
        category: data.category.toUpperCase(),
        slug,
        tags,
      },
    });
  }

  async update(id: string, data: any) {
    this.invalidateCache();
    const updateData = { ...data };
    if (updateData.category) {
      updateData.category = updateData.category.toUpperCase();
    }
    if (updateData.tags && Array.isArray(updateData.tags)) {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    return this.prisma.contentItem.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    this.invalidateCache();
    return this.prisma.contentItem.delete({
      where: { id },
    });
  }

  async register(id: string, attendeeData?: { name?: string; email?: string }) {
    this.invalidateCache();
    const item = await this.findOne(id);
    const registered = (item.registered || 0) + 1;

    const updated = await this.prisma.contentItem.update({
      where: { id: item.id },
      data: { registered },
    });

    return {
      success: true,
      message: `Successfully registered for ${item.title}`,
      registeredCount: updated.registered,
      registrationId: `REG-${Date.now().toString(36).toUpperCase()}`,
    };
  }
}
