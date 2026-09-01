import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary() {
    const [
      totalRecords,
      totalCopies,
      availableCopies,
      activeLoans,
      totalMembers,
      pendingHolds,
      unpaidFines,
    ] = await Promise.all([
      this.prisma.bibliographicRecord.count(),
      this.prisma.itemCopy.count(),
      this.prisma.itemCopy.count({ where: { status: 'AVAILABLE' } }),
      this.prisma.circulationLoan.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.reservation.count({ where: { status: 'PENDING' } }),
      this.prisma.fine.aggregate({
        where: { status: 'UNPAID' },
        _sum: { amount: true },
      }),
    ]);

    // Format breakdown
    const formatBreakdown = await this.prisma.bibliographicRecord.groupBy({
      by: ['format'],
      _count: { format: true },
    });

    // Recent 5 circulation activities
    const recentActivity = await this.prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, membershipNumber: true } },
      },
    });

    // Overdue loans count
    const now = new Date();
    const overdueCount = await this.prisma.circulationLoan.count({
      where: {
        status: 'ACTIVE',
        dueDate: { lt: now },
      },
    });

    return {
      kpis: {
        totalRecords,
        totalCopies,
        availableCopies,
        activeLoans,
        overdueLoans: overdueCount,
        totalMembers,
        pendingHolds,
        unpaidFinesTotal: unpaidFines._sum.amount || 0,
      },
      formatBreakdown: formatBreakdown.map((f) => ({
        format: f.format,
        count: f._count.format,
      })),
      recentActivity,
    };
  }

  async getCirculationReport() {
    const loans = await this.prisma.circulationLoan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { fullName: true, membershipNumber: true, email: true } },
        copy: { include: { bibRecord: { select: { titleLatin: true, shelfmark: true } } } },
      },
    });

    return loans;
  }

  async getAuditLogs(limit = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 500),
      include: {
        user: { select: { fullName: true, membershipNumber: true } },
      },
    });
  }
}
