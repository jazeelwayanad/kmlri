import { Module } from '@nestjs/common';
import { ReadingListsService } from './reading-lists.service';
import { ReadingListsController } from './reading-lists.controller';

@Module({
  controllers: [ReadingListsController],
  providers: [ReadingListsService],
})
export class ReadingListsModule {}
