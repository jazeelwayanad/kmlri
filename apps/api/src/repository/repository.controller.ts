import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
@Controller('repository')
export class RepositoryController {
  constructor(private readonly repositoryService: RepositoryService) {}

  @Get()
  findAll(@Query('stage') stage?: string, @Query('q') q?: string) {
    return this.repositoryService.findAll(stage, q);
  }

  @Post()
  create(@Body() body: { title: string; type: string; authorName: string; advisorName?: string; departmentName?: string; doi?: string; notes?: string }, @Request() req: any) {
    return this.repositoryService.create({ ...body, submittedById: req.user.id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.repositoryService.update(id, body);
  }

  @Patch(':id/stage')
  updateStage(@Param('id') id: string, @Body('stage') stage: string) {
    return this.repositoryService.updateStage(id, stage);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repositoryService.remove(id);
  }
}
