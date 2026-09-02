import { Module } from '@nestjs/common';
import { AuthoritiesService } from './authorities.service';
import { AuthoritiesController } from './authorities.controller';

@Module({
  controllers: [AuthoritiesController],
  providers: [AuthoritiesService],
  exports: [AuthoritiesService],
})
export class AuthoritiesModule {}
