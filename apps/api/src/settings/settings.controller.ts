import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll(@Query('prefix') prefix?: string) {
    return this.settingsService.findAll(prefix);
  }

  @Get(':key')
  get(@Param('key') key: string) {
    return this.settingsService.get(key);
  }

  @Put()
  upsertMany(@Body() body: { entries: { key: string; value: any; description?: string }[] }) {
    return this.settingsService.upsertMany(body.entries);
  }

  @Put(':key')
  upsert(@Param('key') key: string, @Body() body: { value: any; description?: string }) {
    return this.settingsService.upsert(key, body.value, body.description);
  }
}
