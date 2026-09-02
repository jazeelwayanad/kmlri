import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { SearchQueryDto } from './dto/search-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('search')
  search(@Query() queryDto: SearchQueryDto) {
    return this.catalogService.search(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catalogService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Post()
  create(@Body() dto: CreateRecordDto) {
    return this.catalogService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Post(':id/copies')
  addCopy(
    @Param('id') id: string,
    @Body() body: { location?: string; barcode?: string; rfidTag?: string; status?: string; imageUrl?: string },
  ) {
    return this.catalogService.addCopy(id, body.location, body.barcode, body.rfidTag, body.status, body.imageUrl);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Patch(':id/copies/:copyId')
  updateCopy(
    @Param('copyId') copyId: string,
    @Body() body: { barcode?: string; rfidTag?: string; location?: string; status?: string; imageUrl?: string },
  ) {
    return this.catalogService.updateCopy(copyId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Delete(':id/copies/:copyId')
  removeCopy(@Param('copyId') copyId: string) {
    return this.catalogService.removeCopy(copyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateRecordDto>) {
    return this.catalogService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catalogService.remove(id);
  }
}
