import { Module } from '@nestjs/common';
import { AcquisitionsService } from './acquisitions.service';
import { AcquisitionsController } from './acquisitions.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AcquisitionsController],
  providers: [AcquisitionsService],
})
export class AcquisitionsModule {}
