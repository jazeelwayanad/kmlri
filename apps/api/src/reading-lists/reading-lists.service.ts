import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReadingListsService {
  constructor(private prisma: PrismaService) {}

  private async withItems(list: { itemIds: string; [key: string]: any }) {
    let ids: string[] = [];
    try {
      ids = JSON.parse(list.itemIds);
    } catch {
      ids = [];
    }
    const items = ids.length
      ? await this.prisma.bibliographicRecord.findMany({
          where: { id: { in: ids } },
          select: { id: true, titleLatin: true, titleArabic: true, shelfmark: true, format: true, coverImageUrl: true },
        })
      : [];
    return { ...list, itemIds: ids, items };
  }

  async findAll(userId: string) {
    const lists = await this.prisma.readingList.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return Promise.all(lists.map((l) => this.withItems(l)));
  }

  async create(userId: string, name: string) {
    if (!name?.trim()) throw new BadRequestException('name is required.');
    const list = await this.prisma.readingList.create({
      data: { userId, name: name.trim(), itemIds: '[]' },
    });
    return this.withItems(list);
  }

  async addItem(id: string, userId: string, bibRecordId: string) {
    const list = await this.prisma.readingList.findUnique({ where: { id } });
    if (!list) throw new NotFoundException('Reading list not found.');
    if (list.userId !== userId) throw new BadRequestException('You do not own this reading list.');

    let ids: string[] = [];
    try {
      ids = JSON.parse(list.itemIds);
    } catch {
      ids = [];
    }
    if (!ids.includes(bibRecordId)) ids.push(bibRecordId);

    const updated = await this.prisma.readingList.update({
      where: { id },
      data: { itemIds: JSON.stringify(ids) },
    });
    return this.withItems(updated);
  }

  async removeItem(id: string, userId: string, bibRecordId: string) {
    const list = await this.prisma.readingList.findUnique({ where: { id } });
    if (!list) throw new NotFoundException('Reading list not found.');
    if (list.userId !== userId) throw new BadRequestException('You do not own this reading list.');

    let ids: string[] = [];
    try {
      ids = JSON.parse(list.itemIds);
    } catch {
      ids = [];
    }
    ids = ids.filter((i) => i !== bibRecordId);

    const updated = await this.prisma.readingList.update({
      where: { id },
      data: { itemIds: JSON.stringify(ids) },
    });
    return this.withItems(updated);
  }

  async remove(id: string, userId: string) {
    const list = await this.prisma.readingList.findUnique({ where: { id } });
    if (!list) throw new NotFoundException('Reading list not found.');
    if (list.userId !== userId) throw new BadRequestException('You do not own this reading list.');
    await this.prisma.readingList.delete({ where: { id } });
    return { success: true };
  }
}
