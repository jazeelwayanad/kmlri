import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  private websiteSettingsCache: Record<string, any> | null = null;
  private websiteSettingsCacheTime: number = 0;
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute fallback TTL with immediate invalidation on write

  constructor(private prisma: PrismaService) {}

  async getPublicWebsiteSettings(): Promise<Record<string, any>> {
    const now = Date.now();
    if (this.websiteSettingsCache && now - this.websiteSettingsCacheTime < this.CACHE_TTL_MS) {
      return this.websiteSettingsCache;
    }

    const settings = await this.findAll('website.');
    const map: Record<string, any> = {};
    for (const s of settings) {
      map[s.key.replace(/^website\./, '')] = s.value;
    }

    this.websiteSettingsCache = map;
    this.websiteSettingsCacheTime = now;
    return map;
  }

  invalidateWebsiteCache() {
    this.websiteSettingsCache = null;
    this.websiteSettingsCacheTime = 0;
  }

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
    if (key.startsWith('website.')) {
      this.invalidateWebsiteCache();
    }
    return { ...setting, value: this.parseValue(setting.value) };
  }

  async upsertMany(entries: { key: string; value: any; description?: string }[]) {
    if (!Array.isArray(entries)) throw new BadRequestException('entries must be an array.');
    const results = [];
    let hasWebsiteEntry = false;
    for (const entry of entries) {
      results.push(await this.upsert(entry.key, entry.value, entry.description));
      if (entry.key?.startsWith('website.')) hasWebsiteEntry = true;
    }
    if (hasWebsiteEntry) {
      this.invalidateWebsiteCache();
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
