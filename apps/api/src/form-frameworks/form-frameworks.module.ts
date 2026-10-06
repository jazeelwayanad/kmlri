import { Module } from '@nestjs/common';
import { FormFrameworksService } from './form-frameworks.service';
import { FormFrameworksController } from './form-frameworks.controller';

@Module({
  controllers: [FormFrameworksController],
  providers: [FormFrameworksService],
  exports: [FormFrameworksService],
})
export class FormFrameworksModule {}
