import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('permissions')
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  getPermissions() {
    return this.rolesService.getAvailablePermissions();
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  create(@Body() data: { name: string; slug?: string; description?: string; permissions: string[] }) {
    return this.rolesService.create(data);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  update(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string; permissions?: string[] },
  ) {
    return this.rolesService.update(id, data);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  delete(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }
}
