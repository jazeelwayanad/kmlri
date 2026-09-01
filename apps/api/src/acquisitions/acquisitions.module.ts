import { Module } from '@nestjs/common';
import { AcquisitionsService } from './acquisitions.service';
import { AcquisitionsController } from './acquisitions.controller';

@Module({
  controllers: [AcquisitionsController],
  providers: [AcquisitionsService],
})
export class AcquisitionsModule {}
