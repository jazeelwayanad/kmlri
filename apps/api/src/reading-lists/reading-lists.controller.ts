import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ReadingListsService } from './reading-lists.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reading-lists')
export class ReadingListsController {
  constructor(private readonly readingListsService: ReadingListsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.readingListsService.findAll(req.user.id);
  }

  @Post()
  create(@Body('name') name: string, @Request() req: any) {
    return this.readingListsService.create(req.user.id, name);
  }

  @Post(':id/items/:bibRecordId')
  addItem(@Param('id') id: string, @Param('bibRecordId') bibRecordId: string, @Request() req: any) {
    return this.readingListsService.addItem(id, req.user.id, bibRecordId);
  }

  @Delete(':id/items/:bibRecordId')
  removeItem(@Param('id') id: string, @Param('bibRecordId') bibRecordId: string, @Request() req: any) {
    return this.readingListsService.removeItem(id, req.user.id, bibRecordId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.readingListsService.remove(id, req.user.id);
  }
}
