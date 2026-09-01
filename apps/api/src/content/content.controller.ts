import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('featured') featured?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    const isFeatured = featured !== undefined ? featured === 'true' : undefined;
    return this.contentService.findAll({
      category,
      featured: isFeatured,
      search,
      limit,
      page,
    });
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.contentService.findOne(idOrSlug);
  }

  @Post(':id/register')
  register(@Param('id') id: string, @Body() body: any) {
    return this.contentService.register(id, body);
  }

  @Post()
  create(@Body() body: any) {
    return this.contentService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.contentService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentService.remove(id);
  }
}
