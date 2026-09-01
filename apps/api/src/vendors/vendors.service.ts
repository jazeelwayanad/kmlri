import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string) {
    return this.prisma.vendor.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { type: { contains: search } },
              { contactPerson: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async create(data: { name: string; type?: string; contactPerson?: string; email?: string; phone?: string; notes?: string }) {
    if (!data.name?.trim()) throw new BadRequestException('name is required.');
    return this.prisma.vendor.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; type: string; contactPerson: string; email: string; phone: string; notes: string; status: string }>) {
    const existing = await this.prisma.vendor.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Vendor not found.');
    return this.prisma.vendor.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await this.prisma.vendor.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Vendor not found.');
    await this.prisma.vendor.delete({ where: { id } });
    return { success: true };
  }
}
