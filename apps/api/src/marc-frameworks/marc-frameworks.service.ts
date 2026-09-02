import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFrameworkDto } from './dto/create-framework.dto';
import { CreateFrameworkFieldDto } from './dto/create-framework-field.dto';
import { ValidateFieldsDto } from './dto/validate-fields.dto';

@Injectable()
export class MarcFrameworksService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.marcFramework.findMany({
      orderBy: { code: 'asc' },
      include: { _count: { select: { fields: true } } },
    });
  }

  async findOneByCode(code: string) {
    const framework = await this.prisma.marcFramework.findUnique({
      where: { code },
      include: { fields: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!framework) throw new NotFoundException(`MARC framework "${code}" not found.`);
    return framework;
  }

  async create(dto: CreateFrameworkDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.marcFramework.findUnique({ where: { code } });
    if (existing) throw new ConflictException(`A MARC framework with code "${code}" already exists.`);

    if (dto.isDefault) {
      await this.prisma.marcFramework.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    }

    return this.prisma.marcFramework.create({ data: { ...dto, code } });
  }

  async update(code: string, data: Partial<CreateFrameworkDto>) {
    const existing = await this.prisma.marcFramework.findUnique({ where: { code } });
    if (!existing) throw new NotFoundException(`MARC framework "${code}" not found.`);

    const updateData: any = { ...data };
    if (data.code) {
      const newCode = data.code.trim().toUpperCase();
      if (newCode !== existing.code) {
        const dup = await this.prisma.marcFramework.findUnique({ where: { code: newCode } });
        if (dup) throw new ConflictException(`A MARC framework with code "${newCode}" already exists.`);
      }
      updateData.code = newCode;
    }

    if (data.isDefault) {
      await this.prisma.marcFramework.updateMany({
        where: { isDefault: true, id: { not: existing.id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.marcFramework.update({ where: { id: existing.id }, data: updateData });
  }

  async remove(code: string) {
    const existing = await this.prisma.marcFramework.findUnique({ where: { code } });
    if (!existing) throw new NotFoundException(`MARC framework "${code}" not found.`);
    if (existing.isDefault) {
      throw new ConflictException('The default MARC framework cannot be deleted. Set another framework as default first.');
    }
    await this.prisma.marcFramework.delete({ where: { id: existing.id } });
    return { success: true };
  }

  // Fields

  private validateFieldShape(dto: Partial<CreateFrameworkFieldDto>) {
    if (dto.tag !== undefined && dto.tag.length !== 3) {
      throw new BadRequestException('tag must be exactly 3 characters, e.g. "245".');
    }
    if (dto.subfield !== undefined && dto.subfield !== null && dto.subfield !== '' && !/^[a-z]$/.test(dto.subfield)) {
      throw new BadRequestException('subfield must be a single lowercase letter, or empty/null for control fields.');
    }
  }

  async addField(frameworkCode: string, dto: CreateFrameworkFieldDto) {
    const framework = await this.prisma.marcFramework.findUnique({ where: { code: frameworkCode } });
    if (!framework) throw new NotFoundException(`MARC framework "${frameworkCode}" not found.`);
    this.validateFieldShape(dto);

    const subfield = dto.subfield || null;
    const existing = await this.prisma.marcFrameworkField.findFirst({
      where: { frameworkId: framework.id, tag: dto.tag, subfield },
    });
    if (existing) {
      throw new ConflictException(
        `Field ${dto.tag}${subfield ? '$' + subfield : ''} already exists on this framework.`,
      );
    }

    return this.prisma.marcFrameworkField.create({
      data: { ...dto, subfield, frameworkId: framework.id },
    });
  }

  async updateField(fieldId: string, data: Partial<CreateFrameworkFieldDto>) {
    const existing = await this.prisma.marcFrameworkField.findUnique({ where: { id: fieldId } });
    if (!existing) throw new NotFoundException('MARC framework field not found.');
    this.validateFieldShape(data);

    const nextTag = data.tag ?? existing.tag;
    const nextSubfield = data.subfield !== undefined ? data.subfield || null : existing.subfield;

    if (nextTag !== existing.tag || nextSubfield !== existing.subfield) {
      const dup = await this.prisma.marcFrameworkField.findFirst({
        where: {
          frameworkId: existing.frameworkId,
          tag: nextTag,
          subfield: nextSubfield,
          id: { not: fieldId },
        },
      });
      if (dup) {
        throw new ConflictException(
          `Field ${nextTag}${nextSubfield ? '$' + nextSubfield : ''} already exists on this framework.`,
        );
      }
    }

    const updateData: any = { ...data };
    if (data.subfield !== undefined) updateData.subfield = data.subfield || null;

    return this.prisma.marcFrameworkField.update({ where: { id: fieldId }, data: updateData });
  }

  async removeField(fieldId: string) {
    const existing = await this.prisma.marcFrameworkField.findUnique({ where: { id: fieldId } });
    if (!existing) throw new NotFoundException('MARC framework field not found.');
    await this.prisma.marcFrameworkField.delete({ where: { id: fieldId } });
    return { success: true };
  }

  async reorderFields(frameworkCode: string, order: { id: string; sortOrder: number }[]) {
    const framework = await this.prisma.marcFramework.findUnique({ where: { code: frameworkCode } });
    if (!framework) throw new NotFoundException(`MARC framework "${frameworkCode}" not found.`);

    await this.prisma.$transaction(
      order.map((o) =>
        this.prisma.marcFrameworkField.updateMany({
          where: { id: o.id, frameworkId: framework.id },
          data: { sortOrder: o.sortOrder },
        }),
      ),
    );

    return this.findOneByCode(frameworkCode);
  }

  // Validation: given a framework code and a set of {tag, subfield, value} entries,
  // return which mandatory fields are missing. Presence-only check.
  async validateEntries(dto: ValidateFieldsDto) {
    const framework = await this.prisma.marcFramework.findUnique({
      where: { code: dto.frameworkCode },
      include: { fields: true },
    });
    if (!framework) throw new NotFoundException(`MARC framework "${dto.frameworkCode}" not found.`);

    const mandatoryFields = framework.fields.filter((f) => f.mandatory);

    const providedKeys = new Set(
      (dto.entries || [])
        .filter((e) => e.value !== undefined && e.value !== null && String(e.value).trim() !== '')
        .map((e) => `${e.tag}$${e.subfield || ''}`),
    );

    const missing = mandatoryFields.filter((f) => !providedKeys.has(`${f.tag}$${f.subfield || ''}`));

    return {
      valid: missing.length === 0,
      missingFields: missing.map((f) => ({
        tag: f.tag,
        subfield: f.subfield,
        label: f.label,
      })),
    };
  }
}
