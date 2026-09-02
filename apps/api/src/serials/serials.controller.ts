import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { SerialsService } from './serials.service';
import { CreateSerialDto } from './dto/create-serial.dto';
import { CreateIssueDto } from './dto/create-issue.dto';
import { CheckInIssueDto } from './dto/check-in-issue.dto';
import { PredictIssuesDto } from './dto/predict-issues.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
@Controller('serials')
export class SerialsController {
  constructor(private readonly serialsService: SerialsService) {}

  // -- Claims & receiving candidates (fixed paths first, ahead of ':id') --

  @Get('claims/candidates')
  getClaimCandidates(@Query('daysOverdue') daysOverdue?: string) {
    const days = daysOverdue ? parseInt(daysOverdue, 10) : 7;
    return this.serialsService.getClaimCandidates(Number.isNaN(days) ? 7 : days);
  }

  @Patch('claims/:claimId')
  updateClaim(@Param('claimId') claimId: string, @Body() dto: UpdateClaimDto, @Request() req: any) {
    return this.serialsService.updateClaim(claimId, dto, req.user?.id);
  }

  @Get('issues/:issueId/claims')
  getIssueClaims(@Param('issueId') issueId: string) {
    return this.serialsService.getIssueClaims(issueId);
  }

  @Post('issues/:issueId/claim')
  createClaim(@Param('issueId') issueId: string, @Body() dto: CreateClaimDto, @Request() req: any) {
    return this.serialsService.createClaim(issueId, dto, req.user?.id);
  }

  // -- Issue-level actions --

  @Patch('issues/:issueId/check-in')
  checkInIssue(@Param('issueId') issueId: string, @Body() dto: CheckInIssueDto, @Request() req: any) {
    return this.serialsService.checkInIssue(issueId, dto, req.user?.id);
  }

  @Patch('issues/:issueId/missing')
  markMissing(@Param('issueId') issueId: string, @Request() req: any) {
    return this.serialsService.markMissing(issueId, req.user?.id);
  }

  @Patch('issues/:issueId/status')
  setIssueStatus(@Param('issueId') issueId: string, @Body() dto: UpdateIssueStatusDto, @Request() req: any) {
    return this.serialsService.setIssueStatus(issueId, dto.status, req.user?.id);
  }

  @Patch('issues/:issueId')
  updateIssue(@Param('issueId') issueId: string, @Body() dto: Partial<CreateIssueDto>, @Request() req: any) {
    return this.serialsService.updateIssue(issueId, dto, req.user?.id);
  }

  // -- Subscriptions --

  @Get()
  findAll(@Query('status') status?: string, @Query('vendorId') vendorId?: string, @Query('q') q?: string) {
    return this.serialsService.findAll({ status, vendorId, q });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serialsService.findOne(id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.serialsService.getHistory(id);
  }

  @Post()
  create(@Body() dto: CreateSerialDto, @Request() req: any) {
    return this.serialsService.create(dto, req.user?.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateSerialDto>, @Request() req: any) {
    return this.serialsService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.serialsService.remove(id, req.user?.id);
  }

  @Post(':id/issues')
  addIssue(@Param('id') id: string, @Body() dto: CreateIssueDto, @Request() req: any) {
    return this.serialsService.addIssue(id, dto, req.user?.id);
  }

  @Post(':id/predict')
  predictIssues(@Param('id') id: string, @Body() dto: PredictIssuesDto, @Request() req: any) {
    return this.serialsService.predictIssues(id, dto.count ?? 1, req.user?.id);
  }
}
