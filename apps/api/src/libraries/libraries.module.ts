import { Module } from '@nestjs/common';
import { LibrariesService } from './libraries.service';
import { LibrariesController } from './libraries.controller';

@Module({
  controllers: [LibrariesController],
  providers: [LibrariesService],
  exports: [LibrariesService],
})
export class LibrariesModule {}
