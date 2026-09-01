import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReproductionRequestsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId?: string) {
    return this.prisma.reproductionRequest.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, fullName: true, membershipNumber: true } } },
    });
  }

  async create(userId: string, data: { itemDescription: string; format?: string; purpose?: string }) {
    if (!data.itemDescription?.trim()) throw new BadRequestException('itemDescription is required.');
    return this.prisma.reproductionRequest.create({
      data: { userId, itemDescription: data.itemDescription, format: data.format, purpose: data.purpose },
    });
  }

  async updateStatus(id: string, status: string) {
    const existing = await this.prisma.reproductionRequest.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Request not found.');
    if (!['SUBMITTED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'REJECTED'].includes(status)) {
      throw new BadRequestException('Invalid status.');
    }
    return this.prisma.reproductionRequest.update({ where: { id }, data: { status } });
  }
}
