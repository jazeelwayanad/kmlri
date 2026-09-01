import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Post()
  create(@Body() body: { name: string; headOfDepartment?: string; budget?: number; notes?: string }) {
    return this.departmentsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.departmentsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
