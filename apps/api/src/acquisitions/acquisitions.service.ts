import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcquisitionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    return this.prisma.acquisitionRequest.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, fullName: true, membershipNumber: true } } },
    });
  }

  async create(
    userId: string,
    data: { title: string; author?: string; publisher?: string; estimatedPrice?: number; reason?: string },
  ) {
    if (!data.title) {
      throw new BadRequestException('title is required.');
    }
    return this.prisma.acquisitionRequest.create({
      data: {
        userId,
        title: data.title,
        author: data.author,
        publisher: data.publisher,
        estimatedPrice: data.estimatedPrice,
        reason: data.reason,
        status: 'SUBMITTED',
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const existing = await this.prisma.acquisitionRequest.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Acquisition request not found.');
    if (!['SUBMITTED', 'APPROVED', 'ORDERED', 'REJECTED'].includes(status)) {
      throw new BadRequestException('Invalid status.');
    }
    return this.prisma.acquisitionRequest.update({ where: { id }, data: { status } });
  }
}
