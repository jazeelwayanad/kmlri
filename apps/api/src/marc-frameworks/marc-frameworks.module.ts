import { Module } from '@nestjs/common';
import { MarcFrameworksService } from './marc-frameworks.service';
import { MarcFrameworksController } from './marc-frameworks.controller';

@Module({
  controllers: [MarcFrameworksController],
  providers: [MarcFrameworksService],
  exports: [MarcFrameworksService],
})
export class MarcFrameworksModule {}
