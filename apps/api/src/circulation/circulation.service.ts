import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IssueBookDto } from './dto/issue-book.dto';
import { ReturnBookDto } from './dto/return-book.dto';

@Injectable()
export class CirculationService {
  constructor(private prisma: PrismaService) {}

  async issueBook(dto: IssueBookDto, librarianStaffId?: string) {
    const copy = await this.prisma.itemCopy.findFirst({
      where: {
        OR: [
          { barcode: dto.barcodeOrRfid.trim() },
          { rfidTag: dto.barcodeOrRfid.trim() },
        ],
      },
      include: { bibRecord: true },
    });

    if (!copy) {
      throw new NotFoundException(`No item copy found with barcode/RFID: ${dto.barcodeOrRfid}`);
    }

    if (copy.status !== 'AVAILABLE') {
      throw new BadRequestException(`Item is currently ${copy.status} and cannot be issued.`);
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { membershipNumber: dto.userMembershipOrEmail.trim() },
          { email: dto.userMembershipOrEmail.trim().toLowerCase() },
        ],
      },
      include: {
        loans: { where: { status: 'ACTIVE' } },
        fines: { where: { status: 'UNPAID' } },
      },
    });

    if (!user) {
      throw new NotFoundException(`Member ${dto.userMembershipOrEmail} not found.`);
    }

    if (user.status !== 'ACTIVE') {
      throw new BadRequestException(`Member account is ${user.status}.`);
    }

    if (user.loans.length >= user.maxBorrowLimit) {
      throw new BadRequestException(`Member has reached max borrow limit of ${user.maxBorrowLimit} items.`);
    }

    const unpaidFinesTotal = user.fines.reduce((acc, f) => acc + f.amount, 0);
    if (unpaidFinesTotal > 200) {
      throw new BadRequestException(`Member has outstanding unpaid fines of ₹${unpaidFinesTotal}. Please settle fines before borrowing.`);
    }

    const durationDays = dto.loanDurationDays || 14;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + durationDays);

    // Create loan and update copy status in transaction
    const [loan] = await this.prisma.$transaction([
      this.prisma.circulationLoan.create({
        data: {
          copyId: copy.id,
          userId: user.id,
          dueDate,
          issuedByStaffId: librarianStaffId,
          status: 'ACTIVE',
        },
        include: {
          copy: { include: { bibRecord: true } },
          user: true,
        },
      }),
      this.prisma.itemCopy.update({
        where: { id: copy.id },
        data: { status: 'ON_LOAN' },
      }),
      this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'ISSUE',
          entity: 'LOAN',
          details: `Issued "${copy.bibRecord.titleLatin}" (${copy.barcode}) to ${user.fullName} (${user.membershipNumber})`,
        },
      }),
    ]);

    return loan;
  }

  async returnBook(dto: ReturnBookDto) {
    const copy = await this.prisma.itemCopy.findFirst({
      where: {
        OR: [
          { barcode: dto.barcodeOrRfid.trim() },
          { rfidTag: dto.barcodeOrRfid.trim() },
        ],
      },
      include: {
        bibRecord: true,
        loans: {
          where: { status: 'ACTIVE' },
          include: { user: true },
          take: 1,
        },
      },
    });

    if (!copy) {
      throw new NotFoundException(`No copy found with barcode/RFID ${dto.barcodeOrRfid}`);
    }

    const activeLoan = copy.loans[0];
    if (!activeLoan) {
      throw new BadRequestException(`Copy ${copy.barcode} is not currently checked out on an active loan.`);
    }

    const now = new Date();
    let fineAmount = 0;
    if (now > activeLoan.dueDate) {
      const diffTime = Math.abs(now.getTime() - activeLoan.dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * 5; // ₹5 per day
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.circulationLoan.update({
        where: { id: activeLoan.id },
        data: {
          status: 'RETURNED',
          returnedAt: now,
        },
      });

      await tx.itemCopy.update({
        where: { id: copy.id },
        data: {
          status: 'AVAILABLE',
          conditionNote: dto.conditionNote || copy.conditionNote,
        },
      });

      if (fineAmount > 0) {
        await tx.fine.create({
          data: {
            loanId: activeLoan.id,
            userId: activeLoan.userId,
            amount: fineAmount,
            reason: 'OVERDUE',
            status: 'UNPAID',
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: activeLoan.userId,
          action: 'RETURN',
          entity: 'LOAN',
          details: `Returned "${copy.bibRecord.titleLatin}" (${copy.barcode}). Late fine: ₹${fineAmount}`,
        },
      });
    });

    return {
      message: 'Item returned successfully',
      title: copy.bibRecord.titleLatin,
      barcode: copy.barcode,
      patron: activeLoan.user.fullName,
      fineAssessed: fineAmount,
    };
  }

  async renewLoan(loanId: string, currentUserId?: string) {
    const loan = await this.prisma.circulationLoan.findUnique({
      where: { id: loanId },
      include: { copy: { include: { bibRecord: true } }, user: true },
    });

    if (!loan) {
      throw new NotFoundException('Active loan not found.');
    }

    if (loan.status !== 'ACTIVE') {
      throw new BadRequestException('Loan is already returned or closed.');
    }

    if (currentUserId && loan.userId !== currentUserId) {
      throw new BadRequestException('You are not authorized to renew this loan.');
    }

    if (loan.renewalCount >= 3) {
      throw new BadRequestException('Maximum renewal limit (3 times) reached. Please bring the item to the library desk.');
    }

    // Check if there are active holds for this bibliographic record
    const pendingHold = await this.prisma.reservation.findFirst({
      where: {
        bibRecordId: loan.copy.bibRecordId,
        status: 'PENDING',
      },
    });

    if (pendingHold) {
      throw new ConflictException('Item has a pending reservation by another researcher and cannot be renewed.');
    }

    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 14);

    const updated = await this.prisma.circulationLoan.update({
      where: { id: loan.id },
      data: {
        dueDate: newDueDate,
        renewalCount: { increment: 1 },
      },
      include: { copy: { include: { bibRecord: true } } },
    });

    return {
      message: 'Loan successfully renewed for 14 days.',
      loanId: updated.id,
      title: updated.copy.bibRecord.titleLatin,
      newDueDate: updated.dueDate,
      renewalCount: updated.renewalCount,
    };
  }

  async getActiveLoans(userId?: string) {
    const where: any = { status: 'ACTIVE' };
    if (userId) {
      where.userId = userId;
    }

    return this.prisma.circulationLoan.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        user: { select: { id: true, fullName: true, membershipNumber: true, email: true } },
        copy: { include: { bibRecord: true } },
      },
    });
  }

  async createHold(bibRecordId: string, userId: string) {
    const record = await this.prisma.bibliographicRecord.findUnique({
      where: { id: bibRecordId },
    });

    if (!record) {
      throw new NotFoundException('Record not found.');
    }

    const existingHold = await this.prisma.reservation.findFirst({
      where: {
        bibRecordId,
        userId,
        status: { in: ['PENDING', 'READY_FOR_PICKUP'] },
      },
    });

    if (existingHold) {
      throw new ConflictException('You already have an active reservation for this title.');
    }

    return this.prisma.reservation.create({
      data: {
        bibRecordId,
        userId,
        status: 'PENDING',
      },
      include: { bibRecord: true },
    });
  }

  async getAllHolds(status?: string) {
    return this.prisma.reservation.findMany({
      where: status ? { status } : { status: { in: ['PENDING', 'READY_FOR_PICKUP'] } },
      orderBy: { requestedAt: 'asc' },
      include: {
        user: { select: { id: true, fullName: true, membershipNumber: true } },
        bibRecord: { select: { id: true, titleLatin: true, shelfmark: true } },
      },
    });
  }

  async markHoldReady(reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!reservation) throw new NotFoundException('Reservation not found.');
    const availableUntil = new Date();
    availableUntil.setDate(availableUntil.getDate() + 5);
    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'READY_FOR_PICKUP', availableUntil },
    });
  }

  async cancelHold(reservationId: string, currentUserId?: string) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!reservation) {
      throw new NotFoundException('Reservation not found.');
    }
    if (currentUserId && reservation.userId !== currentUserId) {
      throw new BadRequestException('You are not authorized to cancel this reservation.');
    }
    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED' },
    });
  }

  async getLoanHistory(userId?: string) {
    const where: any = { status: { in: ['RETURNED', 'OVERDUE'] } };
    if (userId) {
      where.userId = userId;
    }

    return this.prisma.circulationLoan.findMany({
      where,
      orderBy: { returnedAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, membershipNumber: true, email: true } },
        copy: { include: { bibRecord: true } },
      },
    });
  }

  async settleFine(fineId: string) {
    const fine = await this.prisma.fine.findUnique({ where: { id: fineId } });
    if (!fine) throw new NotFoundException('Fine not found.');

    return this.prisma.fine.update({
      where: { id: fineId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });
  }
}
