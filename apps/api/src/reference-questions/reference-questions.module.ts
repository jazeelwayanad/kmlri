import { Module } from '@nestjs/common';
import { ReferenceQuestionsService } from './reference-questions.service';
import { ReferenceQuestionsController } from './reference-questions.controller';

@Module({
  controllers: [ReferenceQuestionsController],
  providers: [ReferenceQuestionsService],
})
export class ReferenceQuestionsModule {}
