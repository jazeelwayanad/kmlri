import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string) {
    return this.prisma.asset.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { category: { contains: search } },
              { serialNumber: { contains: search } },
              { location: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
      include: {
        department: { select: { id: true, name: true } },
        _count: { select: { maintenanceLogs: true, audits: true } },
      },
    });
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        department: true,
        maintenanceLogs: { orderBy: { performedAt: 'desc' } },
        audits: { orderBy: { auditedAt: 'desc' } },
      },
    });
    if (!asset) throw new NotFoundException('Asset not found.');
    return asset;
  }

  async create(data: {
    name: string;
    category?: string;
    serialNumber?: string;
    location?: string;
    purchaseDate?: string;
    purchaseCost?: number;
    notes?: string;
    departmentId?: string;
  }) {
    if (!data.name?.trim()) throw new BadRequestException('name is required.');
    return this.prisma.asset.create({
      data: {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      },
    });
  }

  async update(id: string, data: Partial<{ name: string; category: string; serialNumber: string; location: string; status: string; notes: string; departmentId: string | null }>) {
    const existing = await this.prisma.asset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asset not found.');
    return this.prisma.asset.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await this.prisma.asset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asset not found.');
    await this.prisma.asset.delete({ where: { id } });
    return { success: true };
  }

  async addMaintenance(assetId: string, data: { description: string; cost?: number; performedBy?: string; performedAt?: string }) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found.');
    if (!data.description?.trim()) throw new BadRequestException('description is required.');

    await this.prisma.assetMaintenance.create({
      data: {
        assetId,
        description: data.description,
        cost: data.cost,
        performedBy: data.performedBy,
        performedAt: data.performedAt ? new Date(data.performedAt) : new Date(),
      },
    });
    return this.prisma.asset.update({ where: { id: assetId }, data: { status: 'IN_MAINTENANCE' } });
  }

  async addAudit(assetId: string, data: { condition: string; notes?: string; auditedBy?: string }) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found.');
    if (!data.condition?.trim()) throw new BadRequestException('condition is required.');

    return this.prisma.assetAudit.create({
      data: { assetId, condition: data.condition, notes: data.notes, auditedBy: data.auditedBy },
    });
  }

  async getAllMaintenance() {
    return this.prisma.assetMaintenance.findMany({
      orderBy: { performedAt: 'desc' },
      include: { asset: { select: { id: true, name: true, category: true } } },
    });
  }

  async getAllAudits() {
    return this.prisma.assetAudit.findMany({
      orderBy: { auditedAt: 'desc' },
      include: { asset: { select: { id: true, name: true, category: true } } },
    });
  }
}
