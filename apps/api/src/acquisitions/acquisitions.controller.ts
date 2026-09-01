import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AcquisitionsService } from './acquisitions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('acquisitions')
export class AcquisitionsController {
  constructor(private readonly acquisitionsService: AcquisitionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: any) {
    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'LIBRARIAN'].includes(req.user.role);
    return this.acquisitionsService.findAll(isStaff ? undefined : req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() body: { title: string; author?: string; publisher?: string; estimatedPrice?: number; reason?: string },
    @Request() req: any,
  ) {
    return this.acquisitionsService.create(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.acquisitionsService.updateStatus(id, status);
  }
}
