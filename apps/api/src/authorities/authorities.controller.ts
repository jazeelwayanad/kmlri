import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthoritiesService } from './authorities.service';
import { CreateAuthorityDto } from './dto/create-authority.dto';
import { LinkHeadingDto } from './dto/link-heading.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
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

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(@Body() dto: CreateAuthorityDto) {
    return this.authoritiesService.create(dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.authoritiesService.update(id, body);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authoritiesService.remove(id);
  }

  @Post('link')
  link(@Body() dto: LinkHeadingDto) {
    return this.authoritiesService.link(dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('link/:id')
  unlink(@Param('id') id: string) {
    return this.authoritiesService.unlink(id);
  }
}
