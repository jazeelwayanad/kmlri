import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import * as fs from 'fs';
import { RegistrationsService } from './registrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller()
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Get('content/:id/registration-fields')
  getFields(@Param('id') id: string) {
    return this.registrationsService.getFields(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Put('content/:id/registration-fields')
  setFields(
    @Param('id') id: string,
    @Body() body: { fields: { label: string; fieldType: string; required?: boolean; options?: string[] }[] },
  ) {
    return this.registrationsService.setFields(id, body.fields || []);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('content/:id/registrations')
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }))
  submit(
    @Param('id') id: string,
    @Body() body: Record<string, string>,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    const { submitterName, submitterEmail, ...rest } = body;
    return this.registrationsService.submit(id, submitterName, submitterEmail, rest, files || [], req.user?.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Get('content/:id/registrations')
  findAll(@Param('id') id: string) {
    return this.registrationsService.findAll(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  @Get('registrations/files/:fileId')
  async downloadFile(@Param('fileId') fileId: string, @Res() res: Response) {
    const { file, filePath } = await this.registrationsService.getFileForDownload(fileId);
    if (!fs.existsSync(filePath)) throw new NotFoundException('File not found.');
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    fs.createReadStream(filePath).pipe(res);
  }
}
