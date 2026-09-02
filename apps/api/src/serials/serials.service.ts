import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSerialDto } from './dto/create-serial.dto';
import { CreateIssueDto } from './dto/create-issue.dto';
import { CheckInIssueDto } from './dto/check-in-issue.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';

interface NumberingPattern {
  unit?: 'issue' | 'volume';
  format?: string; // e.g. "Vol. {vol} No. {no}"
  startVolume?: number;
  startNumber?: number;
}

// Number of calendar days to advance for each periodicity code, for the
// simple day-count codes. Month-based codes (MONTHLY, BIMONTHLY, QUARTERLY,
// SEMIANNUAL, ANNUAL) are handled separately via calendar-month arithmetic
// so that e.g. a MONTHLY issue dated Jan 31 rolls to Feb 28/29, not Mar 3.
const DAY_STEP_BY_PERIODICITY: Record<string, number> = {
  DAILY: 1,
  WEEKLY: 7,
  BIWEEKLY: 14,
};

const MONTH_STEP_BY_PERIODICITY: Record<string, number> = {
  MONTHLY: 1,
  BIMONTHLY: 2,
  QUARTERLY: 3,
  SEMIANNUAL: 6,
  ANNUAL: 12,
};

export const PREDICTABLE_PERIODICITY_CODES = [
  ...Object.keys(DAY_STEP_BY_PERIODICITY),
  ...Object.keys(MONTH_STEP_BY_PERIODICITY),
];

@Injectable()
export class SerialsService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------------------
  // Audit logging
  // ---------------------------------------------------------------------
  private async logAudit(params: {
    userId?: string | null;
    action: string;
    entity: 'SERIAL' | 'SERIAL_ISSUE' | 'SERIAL_CLAIM';
    entityId?: string | null;
    details?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: params.userId ?? undefined,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId ?? undefined,
          details: params.details,
        },
      });
    } catch {
      // Audit logging must never break the primary operation.
    }
  }

  // ---------------------------------------------------------------------
  // Subscriptions (Serial) CRUD
  // ---------------------------------------------------------------------

  findAll(params: { status?: string; vendorId?: string; q?: string }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.vendorId) where.vendorId = params.vendorId;
    if (params.q) where.title = { contains: params.q };

    return this.prisma.serial.findMany({
      where,
      orderBy: { title: 'asc' },
      include: {
        vendor: true,
        library: true,
        issues: { orderBy: { expectedDate: 'desc' }, take: 10 },
      },
    });
  }

  async findOne(id: string) {
    const serial = await this.prisma.serial.findUnique({
      where: { id },
      include: {
        vendor: true,
        library: true,
        issues: { orderBy: [{ expectedDate: 'desc' }, { createdAt: 'desc' }] },
      },
    });
    if (!serial) throw new NotFoundException('Serial not found.');
    return serial;
  }

  async create(dto: CreateSerialDto, userId?: string) {
    if (!dto.title?.trim()) throw new BadRequestException('title is required.');
    const serial = await this.prisma.serial.create({
      data: {
        title: dto.title,
        shelfmark: dto.shelfmark,
        frequency: dto.frequency,
        periodicityCode: dto.periodicityCode,
        numberingPattern: dto.numberingPattern,
        publisher: dto.publisher,
        notes: dto.notes,
        bibRecordId: dto.bibRecordId,
        vendorId: dto.vendorId,
        libraryId: dto.libraryId,
        locationCode: dto.locationCode,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status,
        cost: dto.cost,
        currency: dto.currency,
        renewalNote: dto.renewalNote,
      },
    });
    await this.logAudit({
      userId,
      action: 'SERIAL_SUBSCRIPTION_CREATE',
      entity: 'SERIAL',
      entityId: serial.id,
      details: `Created subscription "${serial.title}"`,
    });
    return serial;
  }

  async update(id: string, dto: Partial<CreateSerialDto>, userId?: string) {
    const existing = await this.prisma.serial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Serial not found.');

    const data: any = { ...dto };
    if (dto.startDate !== undefined) data.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined) data.endDate = dto.endDate ? new Date(dto.endDate) : null;

    const updated = await this.prisma.serial.update({ where: { id }, data });

    const changes: string[] = [];
    for (const key of Object.keys(dto)) {
      const before = (existing as any)[key];
      const after = (updated as any)[key];
      if (String(before ?? '') !== String(after ?? '')) {
        changes.push(`${key}: ${before ?? '—'} -> ${after ?? '—'}`);
      }
    }
    await this.logAudit({
      userId,
      action: 'SERIAL_SUBSCRIPTION_UPDATE',
      entity: 'SERIAL',
      entityId: id,
      details: changes.length ? changes.join('; ') : 'No field changes',
    });
    return updated;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.prisma.serial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Serial not found.');
    await this.prisma.serial.delete({ where: { id } });
    await this.logAudit({
      userId,
      action: 'SERIAL_SUBSCRIPTION_DELETE',
      entity: 'SERIAL',
      entityId: id,
      details: `Deleted subscription "${existing.title}"`,
    });
    return { success: true };
  }

  // ---------------------------------------------------------------------
  // Issue creation (manual)
  // ---------------------------------------------------------------------

  async addIssue(serialId: string, dto: CreateIssueDto, userId?: string) {
    const serial = await this.prisma.serial.findUnique({ where: { id: serialId } });
    if (!serial) throw new NotFoundException('Serial not found.');
    if (!dto.issueLabel?.trim()) throw new BadRequestException('issueLabel is required.');

    const issue = await this.prisma.serialIssue.create({
      data: {
        serialId,
        issueLabel: dto.issueLabel,
        volume: dto.volume,
        number: dto.number,
        publicationDate: dto.publicationDate ? new Date(dto.publicationDate) : undefined,
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
        isSupplement: dto.isSupplement ?? false,
        isIndex: dto.isIndex ?? false,
        bindingNote: dto.bindingNote,
      },
    });
    await this.logAudit({
      userId,
      action: 'SERIAL_ISSUE_CREATE',
      entity: 'SERIAL_ISSUE',
      entityId: issue.id,
      details: `Added issue "${issue.issueLabel}" to subscription ${serialId}`,
    });
    return issue;
  }

  async updateIssue(issueId: string, data: Partial<CreateIssueDto>, userId?: string) {
    const existing = await this.prisma.serialIssue.findUnique({ where: { id: issueId } });
    if (!existing) throw new NotFoundException('Issue not found.');

    const updateData: any = { ...data };
    if (data.publicationDate !== undefined) updateData.publicationDate = data.publicationDate ? new Date(data.publicationDate) : null;
    if (data.expectedDate !== undefined) updateData.expectedDate = data.expectedDate ? new Date(data.expectedDate) : null;

    const updated = await this.prisma.serialIssue.update({ where: { id: issueId }, data: updateData });
    await this.logAudit({
      userId,
      action: 'SERIAL_ISSUE_UPDATE',
      entity: 'SERIAL_ISSUE',
      entityId: issueId,
      details: `Edited issue "${updated.issueLabel}" (predicted date/label override)`,
    });
    return updated;
  }

  // ---------------------------------------------------------------------
  // Prediction engine
  // ---------------------------------------------------------------------

  /** Advances `from` by one cadence step of `periodicityCode`. Returns null for unrecognised/IRREGULAR codes. */
  private advanceDate(from: Date, periodicityCode: string): Date | null {
    if (DAY_STEP_BY_PERIODICITY[periodicityCode] !== undefined) {
      const next = new Date(from);
      next.setDate(next.getDate() + DAY_STEP_BY_PERIODICITY[periodicityCode]);
      return next;
    }
    if (MONTH_STEP_BY_PERIODICITY[periodicityCode] !== undefined) {
      const next = new Date(from);
      const day = next.getDate();
      next.setDate(1); // avoid month-length rollover skipping a month
      next.setMonth(next.getMonth() + MONTH_STEP_BY_PERIODICITY[periodicityCode]);
      const daysInTargetMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      next.setDate(Math.min(day, daysInTargetMonth));
      return next;
    }
    return null;
  }

  private parseNumberingPattern(raw?: string | null): NumberingPattern {
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed ? parsed : {};
    } catch {
      return {};
    }
  }

  private formatIssueLabel(pattern: NumberingPattern, volume: number | null, number: number | null): string {
    if (pattern.format) {
      return pattern.format.replace('{vol}', String(volume ?? '')).replace('{no}', String(number ?? ''));
    }
    if (pattern.unit === 'volume' && volume !== null) return `Vol. ${volume}`;
    if (number !== null) return `No. ${number}`;
    return 'Issue';
  }

  /**
   * Generates `count` predicted (status EXPECTED) SerialIssue rows for a
   * subscription, based on its periodicityCode / numberingPattern and the
   * most recent known issue (by receivedDate, falling back to expectedDate,
   * falling back to the subscription's startDate if there is no issue yet).
   * IRREGULAR subscriptions are not auto-predictable — callers must create
   * issues manually via addIssue().
   */
  async predictIssues(serialId: string, count: number, userId?: string) {
    const serial = await this.prisma.serial.findUnique({ where: { id: serialId } });
    if (!serial) throw new NotFoundException('Serial not found.');

    if (!serial.periodicityCode || serial.periodicityCode === 'IRREGULAR') {
      throw new BadRequestException(
        'This subscription has no predictable periodicity (IRREGULAR or unset) — create issues manually.',
      );
    }
    if (!DAY_STEP_BY_PERIODICITY[serial.periodicityCode] && !MONTH_STEP_BY_PERIODICITY[serial.periodicityCode]) {
      throw new BadRequestException(`Unrecognised periodicityCode "${serial.periodicityCode}".`);
    }

    const lastIssue = await this.prisma.serialIssue.findFirst({
      where: { serialId },
      orderBy: [{ receivedDate: 'desc' }, { expectedDate: 'desc' }, { createdAt: 'desc' }],
    });

    let baseDate: Date = lastIssue?.receivedDate ?? lastIssue?.expectedDate ?? serial.startDate ?? new Date();
    const pattern = this.parseNumberingPattern(serial.numberingPattern);

    // Derive the next volume/number to continue the numbering sequence from
    // the last issue when possible, otherwise fall back to the pattern's
    // configured start values.
    let currentVolume = lastIssue?.volume ? parseInt(lastIssue.volume, 10) : pattern.startVolume ?? null;
    let currentNumber = lastIssue?.number ? parseInt(lastIssue.number, 10) : pattern.startNumber ?? null;
    if (currentVolume !== null && Number.isNaN(currentVolume)) currentVolume = pattern.startVolume ?? null;
    if (currentNumber !== null && Number.isNaN(currentNumber)) currentNumber = pattern.startNumber ?? null;

    const created = [];
    for (let i = 0; i < count; i++) {
      const nextDate = this.advanceDate(baseDate, serial.periodicityCode);
      if (!nextDate) break; // unreachable given the guard above, but keeps TS happy
      baseDate = nextDate;

      if (pattern.unit === 'volume') {
        currentVolume = (currentVolume ?? 0) + 1;
      } else if (currentNumber !== null) {
        currentNumber = currentNumber + 1;
      } else {
        currentNumber = 1;
      }

      const issue = await this.prisma.serialIssue.create({
        data: {
          serialId,
          issueLabel: this.formatIssueLabel(pattern, currentVolume, currentNumber),
          volume: currentVolume !== null ? String(currentVolume) : undefined,
          number: currentNumber !== null ? String(currentNumber) : undefined,
          expectedDate: nextDate,
          status: 'EXPECTED',
        },
      });
      created.push(issue);
    }

    await this.logAudit({
      userId,
      action: 'SERIAL_ISSUE_PREDICT',
      entity: 'SERIAL',
      entityId: serialId,
      details: `Predicted ${created.length} upcoming issue(s) for "${serial.title}"`,
    });

    return created;
  }

  // ---------------------------------------------------------------------
  // Receiving workflow
  // ---------------------------------------------------------------------

  async checkInIssue(issueId: string, dto: CheckInIssueDto, userId?: string) {
    const issue = await this.prisma.serialIssue.findUnique({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('Issue not found.');

    const previousStatus = issue.status;
    const receivedDate = dto.receivedDate ? new Date(dto.receivedDate) : new Date();

    const updated = await this.prisma.serialIssue.update({
      where: { id: issueId },
      data: {
        status: 'RECEIVED',
        receivedDate,
        volume: dto.volume ?? undefined,
        number: dto.number ?? undefined,
        bindingNote: dto.bindingNote ?? undefined,
      },
    });

    await this.logAudit({
      userId,
      action: 'SERIAL_ISSUE_RECEIVE',
      entity: 'SERIAL_ISSUE',
      entityId: issueId,
      details: `status: ${previousStatus} -> RECEIVED`,
    });

    // Auto-predict the next expected issue, unless the subscription is
    // IRREGULAR or has no periodicity configured, and unless this issue was
    // a supplement/index (which shouldn't shift the regular cadence).
    let predicted = null;
    if (!updated.isSupplement && !updated.isIndex) {
      const serial = await this.prisma.serial.findUnique({ where: { id: updated.serialId } });
      if (serial?.periodicityCode && serial.periodicityCode !== 'IRREGULAR') {
        try {
          const [next] = await this.predictIssues(updated.serialId, 1, userId);
          predicted = next ?? null;
        } catch {
          // Prediction is best-effort during check-in; ignore failures (e.g. unrecognised code).
        }
      }
    }

    return { issue: updated, predictedNext: predicted };
  }

  // ---------------------------------------------------------------------
  // Missing / late status
  // ---------------------------------------------------------------------

  async markMissing(issueId: string, userId?: string) {
    return this.setIssueStatus(issueId, 'MISSING', userId);
  }

  async setIssueStatus(issueId: string, status: 'MISSING' | 'LATE', userId?: string) {
    const issue = await this.prisma.serialIssue.findUnique({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('Issue not found.');
    const previousStatus = issue.status;
    const updated = await this.prisma.serialIssue.update({ where: { id: issueId }, data: { status } });
    await this.logAudit({
      userId,
      action: status === 'MISSING' ? 'SERIAL_ISSUE_MISSING' : 'SERIAL_ISSUE_LATE',
      entity: 'SERIAL_ISSUE',
      entityId: issueId,
      details: `status: ${previousStatus} -> ${status}`,
    });
    return updated;
  }

  // ---------------------------------------------------------------------
  // Claims workflow
  // ---------------------------------------------------------------------

  async getClaimCandidates(daysOverdue: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOverdue);

    return this.prisma.serialIssue.findMany({
      where: {
        status: 'EXPECTED',
        expectedDate: { lt: cutoff },
      },
      orderBy: { expectedDate: 'asc' },
      include: {
        serial: { include: { vendor: true, library: true } },
      },
    });
  }

  async createClaim(issueId: string, dto: CreateClaimDto, userId?: string) {
    const issue = await this.prisma.serialIssue.findUnique({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('Issue not found.');

    const claim = await this.prisma.serialClaim.create({
      data: {
        issueId,
        claimedByStaffId: userId,
        status: 'SENT',
        notes: dto.notes,
      },
    });

    const previousStatus = issue.status;
    await this.prisma.serialIssue.update({ where: { id: issueId }, data: { status: 'CLAIMED' } });

    await this.logAudit({
      userId,
      action: 'SERIAL_ISSUE_CLAIM',
      entity: 'SERIAL_ISSUE',
      entityId: issueId,
      details: `Claim sent; status: ${previousStatus} -> CLAIMED`,
    });

    return claim;
  }

  async updateClaim(claimId: string, dto: UpdateClaimDto, userId?: string) {
    const existing = await this.prisma.serialClaim.findUnique({ where: { id: claimId } });
    if (!existing) throw new NotFoundException('Claim not found.');

    const updated = await this.prisma.serialClaim.update({
      where: { id: claimId },
      data: {
        status: dto.status,
        notes: dto.notes ?? undefined,
        resolvedAt: dto.status === 'RESOLVED' ? new Date() : existing.resolvedAt,
      },
    });

    await this.logAudit({
      userId,
      action: 'SERIAL_CLAIM_UPDATE',
      entity: 'SERIAL_CLAIM',
      entityId: claimId,
      details: `status: ${existing.status} -> ${updated.status}`,
    });

    return updated;
  }

  async getIssueClaims(issueId: string) {
    const issue = await this.prisma.serialIssue.findUnique({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('Issue not found.');
    return this.prisma.serialClaim.findMany({
      where: { issueId },
      orderBy: { claimedAt: 'desc' },
    });
  }

  // ---------------------------------------------------------------------
  // History
  // ---------------------------------------------------------------------

  async getHistory(serialId: string) {
    const serial = await this.prisma.serial.findUnique({ where: { id: serialId } });
    if (!serial) throw new NotFoundException('Serial not found.');

    const issues = await this.prisma.serialIssue.findMany({
      where: { serialId },
      orderBy: [{ expectedDate: 'desc' }, { createdAt: 'desc' }],
      include: { claims: { orderBy: { claimedAt: 'desc' } } },
    });

    return { serial, issues };
  }
}
