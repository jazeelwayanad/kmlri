import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LibrariesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.library.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const library = await this.prisma.library.findUnique({ where: { id } });
    if (!library) throw new NotFoundException('Library not found.');
    return library;
  }

  async create(data: { code: string; name: string; address?: string; phone?: string; email?: string; isActive?: boolean }) {
    if (!data.code?.trim()) throw new BadRequestException('code is required.');
    if (!data.name?.trim()) throw new BadRequestException('name is required.');
    const code = data.code.trim().toUpperCase();
    const existing = await this.prisma.library.findUnique({ where: { code } });
    if (existing) throw new ConflictException(`A library with code "${code}" already exists.`);
    return this.prisma.library.create({ data: { ...data, code } });
  }

  async update(
    id: string,
    data: Partial<{ code: string; name: string; address: string; phone: string; email: string; isActive: boolean }>,
  ) {
    const existing = await this.prisma.library.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Library not found.');

    const updateData: any = { ...data };
    if (data.code) {
      const code = data.code.trim().toUpperCase();
      if (code !== existing.code) {
        const dup = await this.prisma.library.findUnique({ where: { code } });
        if (dup) throw new ConflictException(`A library with code "${code}" already exists.`);
      }
      updateData.code = code;
    }

    return this.prisma.library.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    const existing = await this.prisma.library.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Library not found.');

    const [serialCount, homeCount, currentCount] = await Promise.all([
      this.prisma.serial.count({ where: { libraryId: id } }),
      this.prisma.itemCopy.count({ where: { homeLibraryCode: existing.code } }),
      this.prisma.itemCopy.count({ where: { currentLibraryCode: existing.code } }),
    ]);

    if (serialCount > 0 || homeCount > 0 || currentCount > 0) {
      throw new ConflictException(
        `This library is in use (${serialCount} serial(s), ${homeCount} item(s) with this home branch, ${currentCount} item(s) currently held here) and cannot be deleted.`,
      );
    }

    await this.prisma.library.delete({ where: { id } });
    return { success: true };
  }
}
