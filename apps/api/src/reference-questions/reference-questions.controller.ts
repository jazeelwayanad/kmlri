import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ReferenceQuestionsService } from './reference-questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reference-questions')
export class ReferenceQuestionsController {
  constructor(private readonly referenceQuestionsService: ReferenceQuestionsService) {}

  @Post()
  submit(@Body() body: { name: string; email: string; subject?: string; question: string }) {
    return this.referenceQuestionsService.submit(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Get()
  findAll(@Query('status') status?: string) {
    return this.referenceQuestionsService.findAll(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Patch(':id/answer')
  answer(@Param('id') id: string, @Body('answer') answer: string, @Request() req: any) {
    return this.referenceQuestionsService.answer(id, answer, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.referenceQuestionsService.close(id);
  }
}
