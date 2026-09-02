import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthorisedValuesService } from './authorised-values.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'LIBRARIAN')
@Controller('authorised-values')
export class AuthorisedValuesController {
  constructor(private readonly authorisedValuesService: AuthorisedValuesService) {}

  // Categories

  @Get('categories')
  findAllCategories() {
    return this.authorisedValuesService.findAllCategories();
  }

  @Get('categories/:id')
  findOneCategory(@Param('id') id: string) {
    return this.authorisedValuesService.findOneCategory(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('categories')
  createCategory(@Body() body: { category: string; description?: string }) {
    return this.authorisedValuesService.createCategory(body);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: any) {
    return this.authorisedValuesService.updateCategory(id, body);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.authorisedValuesService.removeCategory(id);
  }

  // Values scoped to a category, addressed by its code, e.g. GET /authorised-values/CCODE
  @Get(':category')
  findValuesByCategory(@Param('category') category: string) {
    return this.authorisedValuesService.findValuesByCategory(category);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('categories/:categoryId/values')
  createValue(@Param('categoryId') categoryId: string, @Body() body: { code: string; description: string; sortOrder?: number }) {
    return this.authorisedValuesService.createValue(categoryId, body);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('values/:id')
  updateValue(@Param('id') id: string, @Body() body: any) {
    return this.authorisedValuesService.updateValue(id, body);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('values/:id')
  removeValue(@Param('id') id: string) {
    return this.authorisedValuesService.removeValue(id);
  }
}
