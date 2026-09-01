import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembershipTypesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.membershipType.findMany({ orderBy: { name: 'asc' } });
  }

  async create(data: { name: string; maxBorrowLimit?: number; loanDurationDays?: number; description?: string }) {
    if (!data.name?.trim()) throw new BadRequestException('name is required.');
    const existing = await this.prisma.membershipType.findUnique({ where: { name: data.name } });
    if (existing) throw new ConflictException('A membership type with this name already exists.');
    return this.prisma.membershipType.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; maxBorrowLimit: number; loanDurationDays: number; description: string }>) {
    const existing = await this.prisma.membershipType.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Membership type not found.');
    return this.prisma.membershipType.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await this.prisma.membershipType.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Membership type not found.');
    await this.prisma.membershipType.delete({ where: { id } });
    return { success: true };
  }
}
