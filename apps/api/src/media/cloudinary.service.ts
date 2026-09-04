import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

// Folder whitelist -- callers pass a short key, never a raw path, so an upload can never
// be written outside these known locations in the Cloudinary account.
const FOLDERS = {
  catalogCovers: 'kmlri/catalog/covers',
  catalogItems: 'kmlri/catalog/items',
  avatars: 'kmlri/avatars',
  storiesNews: 'kmlri/website/stories-news',
  events: 'kmlri/website/events',
  opportunities: 'kmlri/website/opportunities',
  misc: 'kmlri/misc',
} as const;

export type CloudinaryFolderKey = keyof typeof FOLDERS;

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

@Injectable()
export class CloudinaryService implements OnModuleInit {
  onModuleInit() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  resolveFolder(key?: string): string {
    if (key && key in FOLDERS) return FOLDERS[key as CloudinaryFolderKey];
    return FOLDERS.misc;
  }

  uploadBuffer(buffer: Buffer, folderKey?: string): Promise<CloudinaryUploadResult> {
    const folder = this.resolveFolder(folderKey);
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result) => {
        if (error || !result) return reject(new BadRequestException(error?.message || 'Cloudinary upload failed.'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      });
      stream.end(buffer);
    });
  }

  async uploadFromUrl(sourceUrl: string, folderKey?: string): Promise<CloudinaryUploadResult> {
    const folder = this.resolveFolder(folderKey);
    try {
      const result = await cloudinary.uploader.upload(sourceUrl, { folder, resource_type: 'image' });
      return { url: result.secure_url, publicId: result.public_id };
    } catch (err: any) {
      throw new BadRequestException(err?.message || 'Cloudinary upload from URL failed.');
    }
  }

  async destroy(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId).catch(() => undefined);
  }
}
