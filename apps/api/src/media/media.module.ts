import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CoverFetchService } from './cover-fetch.service';
import { MediaController } from './media.controller';

@Module({
  controllers: [MediaController],
  providers: [CloudinaryService, CoverFetchService],
  exports: [CloudinaryService, CoverFetchService],
})
export class MediaModule {}
