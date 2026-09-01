import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferenceQuestionsService {
  constructor(private prisma: PrismaService) {}

  async submit(data: { name: string; email: string; subject?: string; question: string }, userId?: string) {
    if (!data.name?.trim() || !data.email?.trim() || !data.question?.trim()) {
      throw new BadRequestException('name, email and question are required.');
    }
    return this.prisma.referenceQuestion.create({
      data: {
        userId,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        subject: data.subject,
        question: data.question.trim(),
        status: 'OPEN',
      },
    });
  }

  async findAll(status?: string) {
    return this.prisma.referenceQuestion.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async answer(id: string, answer: string, staffId: string) {
    const existing = await this.prisma.referenceQuestion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Question not found.');
    if (!answer?.trim()) throw new BadRequestException('answer is required.');
    return this.prisma.referenceQuestion.update({
      where: { id },
      data: {
        answer: answer.trim(),
        status: 'ANSWERED',
        answeredByStaffId: staffId,
        answeredAt: new Date(),
      },
    });
  }

  async close(id: string) {
    const existing = await this.prisma.referenceQuestion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Question not found.');
    return this.prisma.referenceQuestion.update({ where: { id }, data: { status: 'CLOSED' } });
  }
}
