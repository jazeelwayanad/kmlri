import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FormFrameworksService } from './form-frameworks.service';
import { CreateFormFrameworkDto } from './dto/create-form-framework.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('form-frameworks')
export class FormFrameworksController {
  constructor(private readonly frameworksService: FormFrameworksService) {}

  @Get()
  findAll(@Query('recordType') recordType?: string) {
    return this.frameworksService.findAll(recordType);
  }

  @Get('default/:recordType')
  getDefault(@Param('recordType') recordType: string) {
    return this.frameworksService.getDefault(recordType.toUpperCase());
  }

  @Get(':idOrCode')
  findOne(@Param('idOrCode') idOrCode: string) {
    return this.frameworksService.findOne(idOrCode);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  create(@Body() dto: CreateFormFrameworkDto) {
    return this.frameworksService.create(dto);
  }

  @Patch(':idOrCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  update(@Param('idOrCode') idOrCode: string, @Body() body: Partial<CreateFormFrameworkDto>) {
    return this.frameworksService.update(idOrCode, body);
  }

  @Delete(':idOrCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  remove(@Param('idOrCode') idOrCode: string) {
    return this.frameworksService.remove(idOrCode);
  }
}
