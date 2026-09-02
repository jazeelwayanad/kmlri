import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { MarcFrameworksService } from './marc-frameworks.service';
import { CreateFrameworkDto } from './dto/create-framework.dto';
import { CreateFrameworkFieldDto } from './dto/create-framework-field.dto';
import { ValidateFieldsDto } from './dto/validate-fields.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
@Controller('marc-frameworks')
export class MarcFrameworksController {
  constructor(private readonly marcFrameworksService: MarcFrameworksService) {}

  @Get()
  findAll() {
    return this.marcFrameworksService.findAll();
  }

  @Post('validate')
  validate(@Body() dto: ValidateFieldsDto) {
    return this.marcFrameworksService.validateEntries(dto);
  }

  @Get(':code')
  findOneByCode(@Param('code') code: string) {
    return this.marcFrameworksService.findOneByCode(code);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(@Body() dto: CreateFrameworkDto) {
    return this.marcFrameworksService.create(dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':code')
  update(@Param('code') code: string, @Body() dto: Partial<CreateFrameworkDto>) {
    return this.marcFrameworksService.update(code, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':code')
  remove(@Param('code') code: string) {
    return this.marcFrameworksService.remove(code);
  }

  // Fields

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post(':code/fields')
  addField(@Param('code') code: string, @Body() dto: CreateFrameworkFieldDto) {
    return this.marcFrameworksService.addField(code, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':code/fields/reorder')
  reorderFields(@Param('code') code: string, @Body() body: { order: { id: string; sortOrder: number }[] }) {
    return this.marcFrameworksService.reorderFields(code, body.order);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('fields/:fieldId')
  updateField(@Param('fieldId') fieldId: string, @Body() dto: Partial<CreateFrameworkFieldDto>) {
    return this.marcFrameworksService.updateField(fieldId, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('fields/:fieldId')
  removeField(@Param('fieldId') fieldId: string) {
    return this.marcFrameworksService.removeField(fieldId);
  }
}
