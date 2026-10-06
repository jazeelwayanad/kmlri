import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormFrameworkDto } from './dto/create-form-framework.dto';

export const BUILT_IN_FRAMEWORKS: any[] = [];

@Injectable()
export class FormFrameworksService {
  private inMemoryFrameworks: any[] = [];

  constructor(private prisma: PrismaService) {}

  async findAll(recordType?: string) {
    try {
      const where: any = {};
      if (recordType) where.recordType = recordType;
      const dbRecords = await this.prisma.formFramework.findMany({
        where,
        orderBy: [{ isDefault: 'desc' }, { recordType: 'asc' }, { createdAt: 'desc' }],
        include: {
          fields: { orderBy: { sortOrder: 'asc' } },
        },
      });
      if (dbRecords) {
        return dbRecords;
      }
    } catch {
      // Prisma offline or schema mismatch; memory fallback will be used
    }

    return this.inMemoryFrameworks.filter(
      (f) => !recordType || f.recordType?.toUpperCase() === recordType.toUpperCase()
    );
  }

  async findOne(idOrCode: string) {
    const cleanKey = idOrCode.trim().toUpperCase();
    try {
      const record = await this.prisma.formFramework.findFirst({
        where: {
          OR: [{ id: idOrCode }, { code: cleanKey }],
        },
        include: {
          fields: { orderBy: { sortOrder: 'asc' } },
        },
      });
      if (record) return record;
    } catch {
      // fall back to memory
    }

    const mem = this.inMemoryFrameworks.find(
      (f) => f.id === idOrCode || f.code?.toUpperCase() === cleanKey
    );

    if (!mem) throw new NotFoundException(`Form framework "${idOrCode}" not found.`);
    return mem;
  }

  async getDefault(recordType: string) {
    const cleanType = recordType.trim().toUpperCase();
    try {
      const record = await this.prisma.formFramework.findFirst({
        where: { recordType: cleanType },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        include: {
          fields: { orderBy: { sortOrder: 'asc' } },
        },
      });
      if (record) return record;
    } catch {}

    const mem =
      this.inMemoryFrameworks.find((f) => f.recordType?.toUpperCase() === cleanType && f.isDefault) ||
      this.inMemoryFrameworks.find((f) => f.recordType?.toUpperCase() === cleanType);

    if (!mem) throw new NotFoundException(`No form framework found for record type "${recordType}".`);
    return mem;
  }

  async create(dto: CreateFormFrameworkDto) {
    const code = dto.code.trim().toUpperCase();
    try {
      const existing = await this.prisma.formFramework.findUnique({ where: { code } });
      if (existing) throw new ConflictException(`A form framework with code "${code}" already exists.`);

      const created = await this.prisma.formFramework.create({
        data: {
          code,
          name: dto.name,
          recordType: dto.recordType.toUpperCase(),
          description: dto.description || '',
          isDefault: dto.isDefault ?? false,
        },
      });

      if (dto.fields && dto.fields.length > 0) {
        for (let i = 0; i < dto.fields.length; i++) {
          const f = dto.fields[i];
          await this.prisma.formField.create({
            data: {
              frameworkId: created.id,
              name: f.name.trim(),
              label: f.label.trim(),
              type: f.type,
              required: f.required ?? false,
              defaultValue: f.defaultValue,
              options: typeof f.options === 'string' ? f.options : JSON.stringify(f.options || []),
              visibility: f.visibility || 'PUBLIC',
              multiplicity: f.multiplicity ?? false,
              referenceSource: f.referenceSource,
              showInTable: f.showInTable ?? true,
              sortOrder: f.sortOrder ?? i + 1,
            },
          });
        }
      }

      return this.findOne(created.id);
    } catch (err: any) {
      if (err instanceof ConflictException) throw err;
      const newFw = {
        id: `fw-${Date.now()}`,
        code,
        name: dto.name,
        recordType: dto.recordType.toUpperCase(),
        description: dto.description || '',
        isDefault: dto.isDefault ?? false,
        fields: (dto.fields || []).map((f, i) => ({
          id: `field-${Date.now()}-${i}`,
          ...f,
          options: typeof f.options === 'string' ? f.options : JSON.stringify(f.options || []),
          showInTable: f.showInTable ?? true,
          sortOrder: f.sortOrder ?? i + 1,
        })),
      };
      // Remove any duplicate code in memory if present
      this.inMemoryFrameworks = this.inMemoryFrameworks.filter((f) => f.code?.toUpperCase() !== code);
      this.inMemoryFrameworks.push(newFw);
      return newFw;
    }
  }

  async update(idOrCode: string, dto: Partial<CreateFormFrameworkDto>) {
    const existing = await this.findOne(idOrCode);
    try {
      const updateData: any = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.recordType !== undefined) updateData.recordType = dto.recordType.toUpperCase();
      if (dto.isDefault !== undefined) updateData.isDefault = dto.isDefault;

      await this.prisma.formFramework.update({
        where: { id: existing.id },
        data: updateData,
      });

      if (dto.fields) {
        await this.prisma.formField.deleteMany({ where: { frameworkId: existing.id } });
        for (let i = 0; i < dto.fields.length; i++) {
          const f = dto.fields[i];
          await this.prisma.formField.create({
            data: {
              frameworkId: existing.id,
              name: f.name.trim(),
              label: f.label.trim(),
              type: f.type,
              required: f.required ?? false,
              defaultValue: f.defaultValue,
              options: typeof f.options === 'string' ? f.options : JSON.stringify(f.options || []),
              visibility: f.visibility || 'PUBLIC',
              multiplicity: f.multiplicity ?? false,
              referenceSource: f.referenceSource,
              showInTable: f.showInTable ?? true,
              sortOrder: f.sortOrder ?? i + 1,
            },
          });
        }
      }

      return this.findOne(existing.id);
    } catch {
      const idx = this.inMemoryFrameworks.findIndex((f) => f.id === existing.id || f.code === existing.code);
      if (idx >= 0) {
        this.inMemoryFrameworks[idx] = {
          ...this.inMemoryFrameworks[idx],
          ...dto,
          recordType: dto.recordType ? dto.recordType.toUpperCase() : this.inMemoryFrameworks[idx].recordType,
          fields: dto.fields
            ? dto.fields.map((f, i) => ({
                id: f.id || `field-${Date.now()}-${i}`,
                ...f,
                options: typeof f.options === 'string' ? f.options : JSON.stringify(f.options || []),
                showInTable: f.showInTable ?? true,
                sortOrder: f.sortOrder ?? i + 1,
              }))
            : this.inMemoryFrameworks[idx].fields,
        };
        return this.inMemoryFrameworks[idx];
      }
      throw new NotFoundException(`Framework ${idOrCode} not found.`);
    }
  }

  async remove(idOrCode: string) {
    const cleanKey = idOrCode.trim().toUpperCase();
    try {
      const existing = await this.prisma.formFramework.findFirst({
        where: { OR: [{ id: idOrCode }, { code: cleanKey }] },
      });
      if (existing) {
        await this.prisma.formField.deleteMany({ where: { frameworkId: existing.id } });
        await this.prisma.formFramework.delete({ where: { id: existing.id } });
      }
    } catch {}

    this.inMemoryFrameworks = this.inMemoryFrameworks.filter(
      (f) => f.id !== idOrCode && f.code?.toUpperCase() !== cleanKey
    );
    return { success: true };
  }
}
