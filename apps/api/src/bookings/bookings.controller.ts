import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('config')
  getConfig() {
    return this.bookingsService.getConfig();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Put('config')
  updateConfig(@Body() body: any) {
    return this.bookingsService.updateConfig(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: any, @Query('status') status?: string) {
    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'LIBRARIAN'].includes(req.user.role);
    return this.bookingsService.findAll(isStaff ? undefined : req.user.id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Get('all')
  findAllStaff(@Query('status') status?: string) {
    return this.bookingsService.findAll(undefined, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body()
    body: {
      type: string;
      resourceName: string;
      date: string;
      timeSlot: string;
      notes?: string;
      customFieldValues?: Record<string, any>;
    },
    @Request() req: any,
  ) {
    return this.bookingsService.create(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @Body() body: { note?: string },
    @Request() req: any,
  ) {
    return this.bookingsService.approve(id, req.user, body?.note);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() body: { note: string },
    @Request() req: any,
  ) {
    return this.bookingsService.reject(id, req.user, body?.note);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.bookingsService.update(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  cancel(
    @Param('id') id: string,
    @Body() body: { note?: string },
    @Request() req: any,
  ) {
    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'LIBRARIAN'].includes(req.user.role);
    return this.bookingsService.cancel(id, isStaff ? undefined : req.user.id, body?.note);
  }
}
