import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  findAll(@Query('q') q?: string) {
    return this.vendorsService.findAll(q);
  }

  @Post()
  create(@Body() body: { name: string; type?: string; contactPerson?: string; email?: string; phone?: string; notes?: string }) {
    return this.vendorsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.vendorsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorsService.remove(id);
  }
}
