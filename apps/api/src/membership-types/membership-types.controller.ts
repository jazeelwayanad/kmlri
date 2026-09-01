import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { MembershipTypesService } from './membership-types.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
@Controller('membership-types')
export class MembershipTypesController {
  constructor(private readonly membershipTypesService: MembershipTypesService) {}

  @Get()
  findAll() {
    return this.membershipTypesService.findAll();
  }

  @Post()
  create(@Body() body: { name: string; maxBorrowLimit?: number; loanDurationDays?: number; description?: string }) {
    return this.membershipTypesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.membershipTypesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membershipTypesService.remove(id);
  }
}
