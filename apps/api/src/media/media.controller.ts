import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CloudinaryService } from './cloudinary.service';
import { CoverFetchService } from './cover-fetch.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
@Controller('media')
export class MediaController {
  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly coverFetch: CoverFetchService,
  ) {}

  // Looks up a cover image for an ISBN (Google Books -> Open Library -> Amazon) and stores
  // it in Cloudinary under kmlri/catalog/covers. Returns the Cloudinary URL; the caller
  // (the record create/edit form) decides whether to apply it to coverImageUrl.
  @Post('fetch-cover-by-isbn')
  async fetchCoverByIsbn(@Body('isbn') isbn: string) {
    if (!isbn?.trim()) {
      throw new BadRequestException('An ISBN is required.');
    }
    const found = await this.coverFetch.lookup(isbn);
    if (!found) {
      return { found: false as const };
    }
    const uploaded = await this.cloudinary.uploadFromUrl(found.imageUrl, 'catalogCovers');
    return { found: true as const, url: uploaded.url, source: found.source };
  }
}
