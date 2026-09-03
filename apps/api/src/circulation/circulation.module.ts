import { Module } from '@nestjs/common';
import { CirculationService } from './circulation.service';
import { CirculationController } from './circulation.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [NotificationsModule, SettingsModule],
  controllers: [CirculationController],
  providers: [CirculationService],
  exports: [CirculationService],
})
export class CirculationModule {}
