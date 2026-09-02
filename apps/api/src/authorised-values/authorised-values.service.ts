import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthorisedValuesService {
  constructor(private prisma: PrismaService) {}

  // Categories

  findAllCategories() {
    return this.prisma.authorisedValueCategory.findMany({
      orderBy: { category: 'asc' },
      include: { _count: { select: { values: true } } },
    });
  }

  async findOneCategory(id: string) {
    const category = await this.prisma.authorisedValueCategory.findUnique({
      where: { id },
      include: { values: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!category) throw new NotFoundException('Authorised value category not found.');
    return category;
  }

  async createCategory(data: { category: string; description?: string }) {
    if (!data.category?.trim()) throw new BadRequestException('category is required.');
    const category = data.category.trim().toUpperCase();
    const existing = await this.prisma.authorisedValueCategory.findUnique({ where: { category } });
    if (existing) throw new ConflictException(`Category "${category}" already exists.`);
    return this.prisma.authorisedValueCategory.create({ data: { ...data, category } });
  }

  async updateCategory(id: string, data: Partial<{ category: string; description: string }>) {
    const existing = await this.prisma.authorisedValueCategory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Authorised value category not found.');

    const updateData: any = { ...data };
    if (data.category) {
      const category = data.category.trim().toUpperCase();
      if (category !== existing.category) {
        const dup = await this.prisma.authorisedValueCategory.findUnique({ where: { category } });
        if (dup) throw new ConflictException(`Category "${category}" already exists.`);
      }
      updateData.category = category;
    }

    return this.prisma.authorisedValueCategory.update({ where: { id }, data: updateData });
  }

  async removeCategory(id: string) {
    const existing = await this.prisma.authorisedValueCategory.findUnique({
      where: { id },
      include: { _count: { select: { values: true } } },
    });
    if (!existing) throw new NotFoundException('Authorised value category not found.');
    if (existing._count.values > 0) {
      throw new ConflictException('This category still has authorised values and cannot be deleted.');
    }
    await this.prisma.authorisedValueCategory.delete({ where: { id } });
    return { success: true };
  }

  // Values

  async findValuesByCategory(category: string) {
    const categoryCode = category.trim().toUpperCase();
    const categoryRecord = await this.prisma.authorisedValueCategory.findUnique({ where: { category: categoryCode } });
    if (!categoryRecord) throw new NotFoundException(`Authorised value category "${categoryCode}" not found.`);
    return this.prisma.authorisedValue.findMany({
      where: { categoryId: categoryRecord.id },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createValue(categoryId: string, data: { code: string; description: string; sortOrder?: number }) {
    const categoryRecord = await this.prisma.authorisedValueCategory.findUnique({ where: { id: categoryId } });
    if (!categoryRecord) throw new NotFoundException('Authorised value category not found.');
    if (!data.code?.trim()) throw new BadRequestException('code is required.');
    if (!data.description?.trim()) throw new BadRequestException('description is required.');

    const existing = await this.prisma.authorisedValue.findUnique({
      where: { categoryId_code: { categoryId, code: data.code.trim() } },
    });
    if (existing) throw new ConflictException(`Value "${data.code}" already exists in this category.`);

    return this.prisma.authorisedValue.create({
      data: { categoryId, code: data.code.trim(), description: data.description, sortOrder: data.sortOrder ?? 0 },
    });
  }

  async updateValue(id: string, data: Partial<{ code: string; description: string; sortOrder: number }>) {
    const existing = await this.prisma.authorisedValue.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Authorised value not found.');

    const updateData: any = { ...data };
    if (data.code) {
      const code = data.code.trim();
      if (code !== existing.code) {
        const dup = await this.prisma.authorisedValue.findUnique({
          where: { categoryId_code: { categoryId: existing.categoryId, code } },
        });
        if (dup) throw new ConflictException(`Value "${code}" already exists in this category.`);
      }
      updateData.code = code;
    }

    return this.prisma.authorisedValue.update({ where: { id }, data: updateData });
  }

  async removeValue(id: string) {
    const existing = await this.prisma.authorisedValue.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Authorised value not found.');
    await this.prisma.authorisedValue.delete({ where: { id } });
    return { success: true };
  }
}
