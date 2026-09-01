import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SerialsService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string) {
    return this.prisma.serial.findMany({
      where: search ? { title: { contains: search } } : undefined,
      orderBy: { title: 'asc' },
      include: { issues: { orderBy: { expectedDate: 'desc' }, take: 10 } },
    });
  }

  async create(data: { title: string; shelfmark?: string; frequency?: string; publisher?: string; notes?: string }) {
    if (!data.title?.trim()) throw new BadRequestException('title is required.');
    return this.prisma.serial.create({ data });
  }

  async update(id: string, data: Partial<{ title: string; shelfmark: string; frequency: string; publisher: string; notes: string }>) {
    const existing = await this.prisma.serial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Serial not found.');
    return this.prisma.serial.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await this.prisma.serial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Serial not found.');
    await this.prisma.serial.delete({ where: { id } });
    return { success: true };
  }

  async addIssue(serialId: string, data: { issueLabel: string; expectedDate?: string }) {
    const serial = await this.prisma.serial.findUnique({ where: { id: serialId } });
    if (!serial) throw new NotFoundException('Serial not found.');
    if (!data.issueLabel?.trim()) throw new BadRequestException('issueLabel is required.');
    return this.prisma.serialIssue.create({
      data: {
        serialId,
        issueLabel: data.issueLabel,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
      },
    });
  }

  async checkInIssue(issueId: string) {
    const issue = await this.prisma.serialIssue.findUnique({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('Issue not found.');
    return this.prisma.serialIssue.update({
      where: { id: issueId },
      data: { status: 'RECEIVED', receivedDate: new Date() },
    });
  }

  async markMissing(issueId: string) {
    const issue = await this.prisma.serialIssue.findUnique({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('Issue not found.');
    return this.prisma.serialIssue.update({ where: { id: issueId }, data: { status: 'MISSING' } });
  }
}
