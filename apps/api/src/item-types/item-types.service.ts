import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemTypesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.itemType.findMany({ orderBy: { code: 'asc' } });
  }

  async findOne(id: string) {
    const itemType = await this.prisma.itemType.findUnique({ where: { id } });
    if (!itemType) throw new NotFoundException('Item type not found.');
    return itemType;
  }

  async create(data: { code: string; description: string; isSerial?: boolean; loanDurationDays?: number }) {
    if (!data.code?.trim()) throw new BadRequestException('code is required.');
    if (!data.description?.trim()) throw new BadRequestException('description is required.');
    const code = data.code.trim().toUpperCase();
    const existing = await this.prisma.itemType.findUnique({ where: { code } });
    if (existing) throw new ConflictException(`An item type with code "${code}" already exists.`);
    return this.prisma.itemType.create({ data: { ...data, code } });
  }

  async update(
    id: string,
    data: Partial<{ code: string; description: string; isSerial: boolean; loanDurationDays: number }>,
  ) {
    const existing = await this.prisma.itemType.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Item type not found.');

    const updateData: any = { ...data };
    if (data.code) {
      const code = data.code.trim().toUpperCase();
      if (code !== existing.code) {
        const dup = await this.prisma.itemType.findUnique({ where: { code } });
        if (dup) throw new ConflictException(`An item type with code "${code}" already exists.`);
      }
      updateData.code = code;
    }

    return this.prisma.itemType.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    const existing = await this.prisma.itemType.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Item type not found.');

    const inUse = await this.prisma.itemCopy.count({ where: { itemTypeCode: existing.code } });
    if (inUse > 0) {
      throw new ConflictException(`This item type is in use by ${inUse} item copy/copies and cannot be deleted.`);
    }

    await this.prisma.itemType.delete({ where: { id } });
    return { success: true };
  }
}
