import { Module } from '@nestjs/common';
import { AuthorisedValuesService } from './authorised-values.service';
import { AuthorisedValuesController } from './authorised-values.controller';

@Module({
  controllers: [AuthorisedValuesController],
  providers: [AuthorisedValuesService],
  exports: [AuthorisedValuesService],
})
export class AuthorisedValuesModule {}
