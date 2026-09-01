import { Module } from '@nestjs/common';
import { MembershipTypesService } from './membership-types.service';
import { MembershipTypesController } from './membership-types.controller';

@Module({
  controllers: [MembershipTypesController],
  providers: [MembershipTypesService],
})
export class MembershipTypesModule {}
