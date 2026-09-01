import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAll(@Query('q') q?: string) {
    return this.assetsService.findAll(q);
  }

  @Get('maintenance')
  getAllMaintenance() {
    return this.assetsService.getAllMaintenance();
  }

  @Get('audits')
  getAllAudits() {
    return this.assetsService.getAllAudits();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.assetsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.assetsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }

  @Post(':id/maintenance')
  addMaintenance(@Param('id') id: string, @Body() body: { description: string; cost?: number; performedBy?: string; performedAt?: string }) {
    return this.assetsService.addMaintenance(id, body);
  }

  @Post(':id/audits')
  addAudit(@Param('id') id: string, @Body() body: { condition: string; notes?: string; auditedBy?: string }) {
    return this.assetsService.addAudit(id, body);
  }
}
