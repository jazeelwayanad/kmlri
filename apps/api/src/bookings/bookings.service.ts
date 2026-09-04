import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DynamicBookingField {
  id: string;
  label: string;
  type: 'select' | 'text' | 'textarea' | 'checkbox';
  options?: string[];
  required?: boolean;
  placeholder?: string;
  helpText?: string;
}

export interface BookingTypeConfig {
  id: string;
  name: string;
  description?: string;
  resources: string[];
}

export interface BookingSystemConfig {
  types: BookingTypeConfig[];
  timeSlots: string[];
  customFields: DynamicBookingField[];
  requireVerification: boolean;
  instructions?: string;
}

export const DEFAULT_BOOKING_CONFIG: BookingSystemConfig = {
  types: [
    {
      id: 'READING_DESK',
      name: 'Reading Desk',
      description: 'Individual study desks in the main reading room.',
      resources: ['Desk #01', 'Desk #02', 'Desk #03', 'Desk #04', 'Desk #05', 'Desk #06'],
    },
    {
      id: 'STUDY_ROOM',
      name: 'Specialized Study Room',
      description: 'Quiet research suites for archival and manuscript examination.',
      resources: ['Manuscript Research Lab', 'Archival Seminar Room A', 'Group Study Room B', 'Microform Suite'],
    },
    {
      id: 'LIBRARIAN_CONSULTATION',
      name: 'Librarian Research Consultation',
      description: '1-on-1 reference desk consultation with an archivist.',
      resources: ['Reference Consultation Desk', 'Arabi-Malayalam Specialist Desk', 'Manuscript Conservation Desk'],
    },
  ],
  timeSlots: [
    '09:00 - 11:00',
    '11:00 - 13:00',
    '13:00 - 15:00',
    '15:00 - 17:00',
    '17:00 - 19:00',
  ],
  customFields: [
    {
      id: 'research_purpose',
      label: 'Research Purpose',
      type: 'select',
      options: [
        'Doctoral / PhD Dissertation Research',
        'Academic Publication / Faculty Research',
        'Manuscript / Archival Reading',
        'Independent Historical Study',
        'General Coursework',
      ],
      required: true,
      placeholder: 'Select your research purpose',
    },
    {
      id: 'equipment_needed',
      label: 'Special Equipment / Materials Requested',
      type: 'select',
      options: [
        'None / Standard Study',
        'Manuscript Illumination Lamp & Magnifier',
        'Microfilm / Microfiche Reader',
        'High-Resolution Digital Document Scanner',
        'Audio Recitation Listening Station',
      ],
      required: false,
      placeholder: 'Select equipment if required',
    },
  ],
  requireVerification: true,
  instructions: 'All desk and room bookings are placed in PENDING status until verified by library staff. You will receive an approval note once your slot is confirmed.',
};

const CONFIG_SETTING_KEY = 'facilities.bookingConfig';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async getConfig(): Promise<BookingSystemConfig> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: CONFIG_SETTING_KEY },
    });

    if (!setting) {
      return DEFAULT_BOOKING_CONFIG;
    }

    try {
      const parsed = JSON.parse(setting.value);
      return {
        types: parsed.types || DEFAULT_BOOKING_CONFIG.types,
        timeSlots: parsed.timeSlots || DEFAULT_BOOKING_CONFIG.timeSlots,
        customFields: parsed.customFields || DEFAULT_BOOKING_CONFIG.customFields,
        requireVerification: parsed.requireVerification !== undefined ? parsed.requireVerification : true,
        instructions: parsed.instructions || DEFAULT_BOOKING_CONFIG.instructions,
      };
    } catch {
      return DEFAULT_BOOKING_CONFIG;
    }
  }

  async updateConfig(config: Partial<BookingSystemConfig>) {
    const current = await this.getConfig();
    const updated: BookingSystemConfig = {
      ...current,
      ...config,
    };

    await this.prisma.systemSetting.upsert({
      where: { key: CONFIG_SETTING_KEY },
      create: {
        key: CONFIG_SETTING_KEY,
        value: JSON.stringify(updated),
        description: 'Dynamic Facility Booking Types, Resources, Time Slots & Custom Dropdown Fields',
      },
      update: {
        value: JSON.stringify(updated),
      },
    });

    return updated;
  }

  async findAll(userId?: string, status?: string) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (status && status !== 'ALL') where.status = status;

    const bookings = await this.prisma.booking.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            membershipNumber: true,
            avatarUrl: true,
          },
        },
      },
    });

    return bookings.map((b) => ({
      ...b,
      customFieldValues: this.parseJsonSafely(b.customFieldValues),
    }));
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            membershipNumber: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found.');

    return {
      ...booking,
      customFieldValues: this.parseJsonSafely(booking.customFieldValues),
    };
  }

  async create(
    userId: string,
    data: {
      type: string;
      resourceName: string;
      date: string;
      timeSlot: string;
      notes?: string;
      customFieldValues?: Record<string, any>;
    },
  ) {
    if (!data.type || !data.resourceName || !data.date || !data.timeSlot) {
      throw new BadRequestException('type, resourceName, date and timeSlot are required.');
    }

    const bookingDate = new Date(data.date);

    // Prevent clashes with APPROVED or CONFIRMED bookings for the exact resource, date, and time slot
    const clash = await this.prisma.booking.findFirst({
      where: {
        resourceName: data.resourceName,
        date: bookingDate,
        timeSlot: data.timeSlot,
        status: { in: ['APPROVED', 'CONFIRMED'] },
      },
    });

    if (clash) {
      throw new BadRequestException(
        `${data.resourceName} is already booked & approved for ${data.timeSlot} on this date. Please select another slot or resource.`,
      );
    }

    const customFieldsString = data.customFieldValues ? JSON.stringify(data.customFieldValues) : null;

    return this.prisma.booking.create({
      data: {
        userId,
        type: data.type,
        resourceName: data.resourceName,
        date: bookingDate,
        timeSlot: data.timeSlot,
        notes: data.notes || null,
        status: 'PENDING', // Default all new bookings to PENDING verification
        customFieldValues: customFieldsString,
      },
    });
  }

  async approve(id: string, staffUser: { id: string; fullName?: string }, note?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found.');

    // Check conflict before approval
    const clash = await this.prisma.booking.findFirst({
      where: {
        id: { not: id },
        resourceName: booking.resourceName,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: { in: ['APPROVED', 'CONFIRMED'] },
      },
    });

    if (clash) {
      throw new BadRequestException(
        `Cannot approve: ${booking.resourceName} is already confirmed for ${booking.timeSlot} on this date.`,
      );
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: 'APPROVED',
        adminNote: note || booking.adminNote || 'Approved by library staff.',
        verifiedBy: staffUser.fullName || staffUser.id,
        verifiedAt: new Date(),
      },
    });
  }

  async reject(id: string, staffUser: { id: string; fullName?: string }, note: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found.');

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNote: note || 'Declined by library staff.',
        verifiedBy: staffUser.fullName || staffUser.id,
        verifiedAt: new Date(),
      },
    });
  }

  async update(
    id: string,
    data: {
      type?: string;
      resourceName?: string;
      date?: string;
      timeSlot?: string;
      notes?: string;
      adminNote?: string;
      status?: string;
      customFieldValues?: Record<string, any>;
    },
    staffUser?: { id: string; fullName?: string },
  ) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found.');

    const updateData: any = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.resourceName !== undefined) updateData.resourceName = data.resourceName;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.timeSlot !== undefined) updateData.timeSlot = data.timeSlot;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.adminNote !== undefined) updateData.adminNote = data.adminNote;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.customFieldValues !== undefined) {
      updateData.customFieldValues = JSON.stringify(data.customFieldValues);
    }

    if (staffUser) {
      updateData.verifiedBy = staffUser.fullName || staffUser.id;
      updateData.verifiedAt = new Date();
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateData,
    });
  }

  async cancel(id: string, currentUserId?: string, note?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found.');
    if (currentUserId && booking.userId !== currentUserId) {
      throw new BadRequestException('You are not authorized to cancel this booking.');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        adminNote: note || booking.adminNote || 'Cancelled.',
      },
    });
  }

  private parseJsonSafely(raw: string | null | undefined): Record<string, any> {
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
}
