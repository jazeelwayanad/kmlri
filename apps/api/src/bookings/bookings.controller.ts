import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: any) {
    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'LIBRARIAN'].includes(req.user.role);
    return this.bookingsService.findAll(isStaff ? undefined : req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Get('all')
  findAllStaff() {
    return this.bookingsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() body: { type: string; resourceName: string; date: string; timeSlot: string; notes?: string },
    @Request() req: any,
  ) {
    return this.bookingsService.create(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  cancel(@Param('id') id: string, @Request() req: any) {
    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'LIBRARIAN'].includes(req.user.role);
    return this.bookingsService.cancel(id, isStaff ? undefined : req.user.id);
  }
}
