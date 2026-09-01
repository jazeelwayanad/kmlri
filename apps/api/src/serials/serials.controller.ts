import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { SerialsService } from './serials.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
@Controller('serials')
export class SerialsController {
  constructor(private readonly serialsService: SerialsService) {}

  @Get()
  findAll(@Query('q') q?: string) {
    return this.serialsService.findAll(q);
  }

  @Post()
  create(@Body() body: { title: string; shelfmark?: string; frequency?: string; publisher?: string; notes?: string }) {
    return this.serialsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.serialsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serialsService.remove(id);
  }

  @Post(':id/issues')
  addIssue(@Param('id') id: string, @Body() body: { issueLabel: string; expectedDate?: string }) {
    return this.serialsService.addIssue(id, body);
  }

  @Patch('issues/:issueId/check-in')
  checkInIssue(@Param('issueId') issueId: string) {
    return this.serialsService.checkInIssue(issueId);
  }

  @Patch('issues/:issueId/missing')
  markMissing(@Param('issueId') issueId: string) {
    return this.serialsService.markMissing(issueId);
  }
}
