import { Module } from '@nestjs/common';
import { ReproductionRequestsService } from './reproduction-requests.service';
import { ReproductionRequestsController } from './reproduction-requests.controller';

@Module({
  controllers: [ReproductionRequestsController],
  providers: [ReproductionRequestsService],
})
export class ReproductionRequestsModule {}
