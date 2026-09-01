import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(new RegExp('[̀-ͯ]', 'g'), '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  findAll() {
    return this.prisma.collection.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { records: true } } },
    });
  }

  async create(data: { name: string; description?: string }) {
    if (!data.name?.trim()) throw new BadRequestException('name is required.');
    const slug = this.slugify(data.name);
    const existing = await this.prisma.collection.findFirst({ where: { OR: [{ name: data.name }, { slug }] } });
    if (existing) throw new ConflictException('A collection with this name already exists.');
    return this.prisma.collection.create({ data: { name: data.name, slug, description: data.description } });
  }

  async update(id: string, data: Partial<{ name: string; description: string }>) {
    const existing = await this.prisma.collection.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Collection not found.');
    return this.prisma.collection.update({
      where: { id },
      data: { ...data, ...(data.name && { slug: this.slugify(data.name) }) },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.collection.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Collection not found.');
    await this.prisma.collection.delete({ where: { id } });
    return { success: true };
  }
}
