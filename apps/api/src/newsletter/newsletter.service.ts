import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  async subscribe(email: string) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return { message: 'You are already subscribed to the monthly newsletter.' };
    }

    await this.prisma.newsletterSubscriber.create({
      data: { email: email.toLowerCase().trim() },
    });

    return { message: 'Thank you — please confirm from the email we just sent.' };
  }
}
