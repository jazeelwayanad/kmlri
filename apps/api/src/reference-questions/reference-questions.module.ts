import { Module } from '@nestjs/common';
import { ReferenceQuestionsService } from './reference-questions.service';
import { ReferenceQuestionsController } from './reference-questions.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [ReferenceQuestionsController],
  providers: [ReferenceQuestionsService],
})
export class ReferenceQuestionsModule {}
