import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { LibrariesService } from './libraries.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
@Controller('libraries')
export class LibrariesController {
  constructor(private readonly librariesService: LibrariesService) {}

  @Get()
  findAll() {
    return this.librariesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.librariesService.findOne(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(@Body() body: { code: string; name: string; address?: string; phone?: string; email?: string; isActive?: boolean }) {
    return this.librariesService.create(body);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.librariesService.update(id, body);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.librariesService.remove(id);
  }
}
