import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthoritiesService } from './authorities.service';
import { CreateAuthorityDto } from './dto/create-authority.dto';
import { LinkHeadingDto } from './dto/link-heading.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('authorities')
export class AuthoritiesController {
  constructor(private readonly authoritiesService: AuthoritiesService) {}

  @Get('search')
  search(@Query('q') q?: string, @Query('headingType') headingType?: string) {
    return this.authoritiesService.search(q, headingType);
  }

  @Get(':id/usage')
  usage(@Param('id') id: string) {
    return this.authoritiesService.usage(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authoritiesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  create(@Body() dto: CreateAuthorityDto) {
    return this.authoritiesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  update(@Param('id') id: string, @Body() body: Partial<CreateAuthorityDto>) {
    return this.authoritiesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  remove(@Param('id') id: string) {
    return this.authoritiesService.remove(id);
  }

  @Post('link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  link(@Body() dto: LinkHeadingDto) {
    return this.authoritiesService.link(dto);
  }

  @Delete('link/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
  unlink(@Param('id') id: string) {
    return this.authoritiesService.unlink(id);
  }
}
