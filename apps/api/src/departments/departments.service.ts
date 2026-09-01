import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { assets: true } } },
    });
  }

  async create(data: { name: string; headOfDepartment?: string; budget?: number; notes?: string }) {
    if (!data.name?.trim()) throw new BadRequestException('name is required.');
    const existing = await this.prisma.department.findUnique({ where: { name: data.name } });
    if (existing) throw new ConflictException('A department with this name already exists.');
    return this.prisma.department.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; headOfDepartment: string; budget: number; notes: string }>) {
    const existing = await this.prisma.department.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Department not found.');
    return this.prisma.department.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await this.prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { assets: true } } },
    });
    if (!existing) throw new NotFoundException('Department not found.');
    if (existing._count.assets > 0) {
      throw new ConflictException('This department has assets assigned to it and cannot be deleted.');
    }
    await this.prisma.department.delete({ where: { id } });
    return { success: true };
  }
}
