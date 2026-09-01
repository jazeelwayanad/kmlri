import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const STAGES = ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'];

@Injectable()
export class RepositoryService {
  constructor(private prisma: PrismaService) {}

  findAll(stage?: string, search?: string) {
    return this.prisma.repositorySubmission.findMany({
      where: {
        ...(stage && stage !== 'ALL' && { stage }),
        ...(search && {
          OR: [{ title: { contains: search } }, { authorName: { contains: search } }],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { title: string; type: string; authorName: string; advisorName?: string; departmentName?: string; doi?: string; notes?: string; submittedById?: string }) {
    if (!data.title?.trim() || !data.authorName?.trim()) {
      throw new BadRequestException('title and authorName are required.');
    }
    return this.prisma.repositorySubmission.create({ data: { ...data, stage: 'DRAFT' } });
  }

  async updateStage(id: string, stage: string) {
    const existing = await this.prisma.repositorySubmission.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Submission not found.');
    if (!STAGES.includes(stage)) throw new BadRequestException('Invalid stage.');
    return this.prisma.repositorySubmission.update({ where: { id }, data: { stage } });
  }

  async update(id: string, data: Partial<{ title: string; type: string; authorName: string; advisorName: string; departmentName: string; doi: string; notes: string }>) {
    const existing = await this.prisma.repositorySubmission.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Submission not found.');
    return this.prisma.repositorySubmission.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await this.prisma.repositorySubmission.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Submission not found.');
    await this.prisma.repositorySubmission.delete({ where: { id } });
    return { success: true };
  }
}
