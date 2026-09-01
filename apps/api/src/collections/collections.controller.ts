import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  findAll() {
    return this.collectionsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Post()
  create(@Body() body: { name: string; description?: string }) {
    return this.collectionsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.collectionsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collectionsService.remove(id);
  }
}
