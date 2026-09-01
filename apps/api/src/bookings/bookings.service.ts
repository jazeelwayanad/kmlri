import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    return this.prisma.booking.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { date: 'desc' },
      include: { user: { select: { id: true, fullName: true, membershipNumber: true } } },
    });
  }

  async create(
    userId: string,
    data: { type: string; resourceName: string; date: string; timeSlot: string; notes?: string },
  ) {
    if (!data.type || !data.resourceName || !data.date || !data.timeSlot) {
      throw new BadRequestException('type, resourceName, date and timeSlot are required.');
    }

    const clash = await this.prisma.booking.findFirst({
      where: {
        resourceName: data.resourceName,
        date: new Date(data.date),
        timeSlot: data.timeSlot,
        status: 'CONFIRMED',
      },
    });
    if (clash) {
      throw new BadRequestException(`${data.resourceName} is already booked for ${data.timeSlot} on this date.`);
    }

    return this.prisma.booking.create({
      data: {
        userId,
        type: data.type,
        resourceName: data.resourceName,
        date: new Date(data.date),
        timeSlot: data.timeSlot,
        notes: data.notes,
        status: 'CONFIRMED',
      },
    });
  }

  async cancel(id: string, currentUserId?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found.');
    if (currentUserId && booking.userId !== currentUserId) {
      throw new BadRequestException('You are not authorized to cancel this booking.');
    }
    return this.prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' } });
  }
}
