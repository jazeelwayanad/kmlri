import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'registrations');
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

  // --- Registration form field configuration ---

  async getFields(contentItemId: string) {
    return this.prisma.registrationField.findMany({
      where: { contentItemId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async setFields(
    contentItemId: string,
    fields: { label: string; fieldType: string; required?: boolean; options?: string[] }[],
  ) {
    const item = await this.prisma.contentItem.findUnique({ where: { id: contentItemId } });
    if (!item) throw new NotFoundException('Content item not found.');

    const validTypes = ['TEXT', 'EMAIL', 'PHONE', 'NUMBER', 'TEXTAREA', 'SELECT', 'CHECKBOX', 'FILE'];
    for (const f of fields) {
      if (!f.label?.trim()) throw new BadRequestException('Every field needs a label.');
      if (!validTypes.includes(f.fieldType)) throw new BadRequestException(`Invalid field type: ${f.fieldType}`);
    }

    await this.prisma.$transaction([
      this.prisma.registrationField.deleteMany({ where: { contentItemId } }),
      ...fields.map((f, i) =>
        this.prisma.registrationField.create({
          data: {
            contentItemId,
            label: f.label,
            fieldType: f.fieldType,
            required: !!f.required,
            options: f.options ? JSON.stringify(f.options) : null,
            sortOrder: i,
          },
        }),
      ),
    ]);

    return this.getFields(contentItemId);
  }

  // --- Registrations / submissions ---

  async submit(
    contentItemId: string,
    submitterName: string,
    submitterEmail: string,
    data: Record<string, string>,
    files: Express.Multer.File[],
    userId?: string,
  ) {
    const item = await this.prisma.contentItem.findUnique({ where: { id: contentItemId } });
    if (!item) throw new NotFoundException('Content item not found.');
    if (!item.registrationEnabled) throw new BadRequestException('Registration is not open for this item.');

    if (!submitterName?.trim() || !submitterEmail?.trim()) {
      throw new BadRequestException('Name and email are required.');
    }

    const fields = await this.getFields(contentItemId);
    for (const field of fields) {
      if (!field.required) continue;
      if (field.fieldType === 'FILE') {
        if (!files.some((f) => f.fieldname === field.label)) {
          throw new BadRequestException(`"${field.label}" is required.`);
        }
      } else if (!data[field.label]?.trim()) {
        throw new BadRequestException(`"${field.label}" is required.`);
      }
    }

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(`File type not allowed: ${file.mimetype}`);
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException(`File "${file.originalname}" exceeds the 10MB limit.`);
      }
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const registration = await this.prisma.registration.create({
      data: {
        contentItemId,
        userId,
        submitterName,
        submitterEmail,
        data: JSON.stringify(data),
      },
    });

    for (const file of files) {
      const storedName = `${randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, storedName), file.buffer);
      await this.prisma.registrationFile.create({
        data: {
          registrationId: registration.id,
          fieldLabel: file.fieldname,
          originalName: file.originalname,
          storedName,
          mimeType: file.mimetype,
          size: file.size,
        },
      });
    }

    await this.prisma.contentItem.update({
      where: { id: contentItemId },
      data: { registered: { increment: 1 } },
    });

    return this.prisma.registration.findUnique({ where: { id: registration.id }, include: { files: true } });
  }

  async findAll(contentItemId: string) {
    return this.prisma.registration.findMany({
      where: { contentItemId },
      orderBy: { createdAt: 'desc' },
      include: { files: true },
    });
  }

  async getFileForDownload(fileId: string) {
    const file = await this.prisma.registrationFile.findUnique({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found.');
    const filePath = path.join(UPLOAD_DIR, file.storedName);
    if (!fs.existsSync(filePath)) throw new NotFoundException('File no longer exists on disk.');
    return { file, filePath };
  }
}
