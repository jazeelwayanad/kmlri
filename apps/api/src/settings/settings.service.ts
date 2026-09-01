import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(prefix?: string) {
    const settings = await this.prisma.systemSetting.findMany({
      where: prefix ? { key: { startsWith: prefix } } : undefined,
      orderBy: { key: 'asc' },
    });
    return settings.map((s) => ({ ...s, value: this.parseValue(s.value) }));
  }

  async get(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) return null;
    return { ...setting, value: this.parseValue(setting.value) };
  }

  async upsert(key: string, value: any, description?: string) {
    if (!key?.trim()) throw new BadRequestException('key is required.');
    const setting = await this.prisma.systemSetting.upsert({
      where: { key },
      create: { key, value: JSON.stringify(value), description },
      update: { value: JSON.stringify(value), ...(description !== undefined && { description }) },
    });
    return { ...setting, value: this.parseValue(setting.value) };
  }

  async upsertMany(entries: { key: string; value: any; description?: string }[]) {
    if (!Array.isArray(entries)) throw new BadRequestException('entries must be an array.');
    const results = [];
    for (const entry of entries) {
      results.push(await this.upsert(entry.key, entry.value, entry.description));
    }
    return results;
  }

  private parseValue(raw: string) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
}
