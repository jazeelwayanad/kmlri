import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Res, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CatalogService } from './catalog.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { SearchQueryDto } from './dto/search-query.dto';
import { DuplicateQueryDto } from './dto/duplicate-query.dto';
import { ExportQueryDto } from './dto/export-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PermissionsGuard } from '../common/permissions.guard';
import { RequirePermissions } from '../common/permissions.decorator';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('search')
  search(@Query() queryDto: SearchQueryDto) {
    return this.catalogService.search(queryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Get('duplicates')
  findDuplicates(@Query() query: DuplicateQueryDto) {
    return this.catalogService.findDuplicates(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @RequirePermissions('CATALOG_IMPORT_EXPORT')
  @Get('export')
  async exportRecords(@Query() query: ExportQueryDto, @Res() res: Response) {
    const format = query.format || 'marcxml';
    const ids = query.ids ? query.ids.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
    const body = await this.catalogService.exportRecords(format, ids);
    const ext = format === 'csv' ? 'csv' : 'xml';
    const contentType = format === 'csv' ? 'text/csv' : 'application/xml';
    res.setHeader('Content-Type', `${contentType}; charset=utf-8`);
    res.setHeader('Content-Disposition', `attachment; filename="catalog-export.${ext}"`);
    res.send(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @RequirePermissions('CATALOG_IMPORT_EXPORT')
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importRecords(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('rows') rowsJson: string | undefined,
  ) {
    let rows: Record<string, string>[];
    if (file) {
      rows = this.parseCsv(file.buffer.toString('utf-8'));
    } else if (rowsJson) {
      rows = typeof rowsJson === 'string' ? JSON.parse(rowsJson) : rowsJson;
    } else {
      throw new BadRequestException('Provide either a CSV file field "file" or a JSON "rows" body field.');
    }
    return this.catalogService.importRecords(rows);
  }

  private parseCsv(text: string): Record<string, string>[] {
    const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
    if (!lines.length) return [];
    const headers = lines[0].split(',').map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const cells = line.split(',');
      const row: Record<string, string> = {};
      headers.forEach((h, i) => (row[h] = (cells[i] ?? '').trim()));
      return row;
    });
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
