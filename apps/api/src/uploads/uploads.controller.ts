import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryService } from '../media/cloudinary.service';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB

@Controller('uploads')
export class UploadsController {
  constructor(private readonly cloudinary: CloudinaryService) {}

  // `folder` is an optional whitelisted key (see CloudinaryService.resolveFolder) selecting
  // where in the Cloudinary account the image is filed -- e.g. 'catalogItems' for item
  // photos, 'storiesNews' for website content, 'avatars' for profile pictures. Defaults to
  // a general 'misc' folder when omitted, so existing callers keep working unchanged.
  @Post('image')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: MAX_IMAGE_SIZE } }))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Body('folder') folder?: string) {
    if (!file) throw new BadRequestException('No file uploaded.');
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported image type: ${file.mimetype}`);
    }

    const result = await this.cloudinary.uploadBuffer(file.buffer, folder);
    return { url: result.url };
  }
}
