import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';

/**
 * Unauthenticated read-only mirror of the "website." settings namespace.
 * The public site (Navbar, Footer, homepage) fetches its layout/navigation
 * configuration from here — anonymous visitors never hit the staff-guarded
 * /settings controller. Only the "website." prefix is ever exposed.
 */
@Controller('public-settings')
export class PublicSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('website')
  async getWebsiteSettings() {
    return this.settingsService.getPublicWebsiteSettings();
  }
}
