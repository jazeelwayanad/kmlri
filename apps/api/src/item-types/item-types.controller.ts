import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ItemTypesService } from './item-types.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
@Controller('item-types')
export class ItemTypesController {
  constructor(private readonly itemTypesService: ItemTypesService) {}

  @Get()
  findAll() {
    return this.itemTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemTypesService.findOne(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(@Body() body: { code: string; description: string; isSerial?: boolean; loanDurationDays?: number }) {
    return this.itemTypesService.create(body);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.itemTypesService.update(id, body);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemTypesService.remove(id);
  }
}
