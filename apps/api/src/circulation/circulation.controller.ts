import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CirculationService } from './circulation.service';
import { IssueBookDto } from './dto/issue-book.dto';
import { ReturnBookDto } from './dto/return-book.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('circulation')
export class CirculationController {
  constructor(private readonly circulationService: CirculationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Post('issue')
  issue(@Body() dto: IssueBookDto, @Request() req: any) {
    return this.circulationService.issueBook(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Post('return')
  returnBook(@Body() dto: ReturnBookDto) {
    return this.circulationService.returnBook(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('renew/:loanId')
  renew(@Param('loanId') loanId: string, @Request() req: any) {
    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'LIBRARIAN'].includes(req.user.role);
    return this.circulationService.renewLoan(loanId, isStaff ? undefined : req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('loans')
  getLoans(@Request() req: any) {
    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'LIBRARIAN'].includes(req.user.role);
    return this.circulationService.getActiveLoans(isStaff ? undefined : req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('loans/history')
  getLoanHistory(@Request() req: any) {
    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'LIBRARIAN'].includes(req.user.role);
    return this.circulationService.getLoanHistory(isStaff ? undefined : req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Get('holds')
  getAllHolds(@Query('status') status?: string) {
    return this.circulationService.getAllHolds(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Patch('hold/:reservationId/ready')
  markHoldReady(@Param('reservationId') reservationId: string) {
    return this.circulationService.markHoldReady(reservationId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('hold/:bibRecordId')
  createHold(@Param('bibRecordId') bibRecordId: string, @Request() req: any) {
    return this.circulationService.createHold(bibRecordId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('hold/:reservationId')
  cancelHold(@Param('reservationId') reservationId: string, @Request() req: any) {
    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'LIBRARIAN'].includes(req.user.role);
    return this.circulationService.cancelHold(reservationId, isStaff ? undefined : req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Post('fines/:fineId/settle')
  settleFine(@Param('fineId') fineId: string) {
    return this.circulationService.settleFine(fineId);
  }
}
