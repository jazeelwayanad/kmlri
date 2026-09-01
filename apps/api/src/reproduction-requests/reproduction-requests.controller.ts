import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ReproductionRequestsService } from './reproduction-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reproduction-requests')
export class ReproductionRequestsController {
  constructor(private readonly reproductionRequestsService: ReproductionRequestsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: any) {
    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'LIBRARIAN'].includes(req.user.role);
    return this.reproductionRequestsService.findAll(isStaff ? undefined : req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: { itemDescription: string; format?: string; purpose?: string }, @Request() req: any) {
    return this.reproductionRequestsService.create(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.reproductionRequestsService.updateStatus(id, status);
  }
}
