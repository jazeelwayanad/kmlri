import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { SavedSearchesService } from './saved-searches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('saved-searches')
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.savedSearchesService.findAll(req.user.id);
  }

  @Post()
  create(@Body() body: { query: string; filters?: Record<string, any> }, @Request() req: any) {
    return this.savedSearchesService.create(req.user.id, body.query, body.filters);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.savedSearchesService.remove(id, req.user.id);
  }
}
