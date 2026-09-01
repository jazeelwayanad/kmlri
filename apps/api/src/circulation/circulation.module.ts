import { Module } from '@nestjs/common';
import { CirculationService } from './circulation.service';
import { CirculationController } from './circulation.controller';

@Module({
  controllers: [CirculationController],
  providers: [CirculationService],
  exports: [CirculationService],
})
export class CirculationModule {}
