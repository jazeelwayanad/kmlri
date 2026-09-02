import { IsOptional, IsString } from 'class-validator';

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  script?: string;

  @IsOptional()
  @IsString()
  access?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  yearFrom?: string;

  @IsOptional()
  @IsString()
  yearTo?: string;

  @IsOptional()
  @IsString()
  sortBy?: string; // recent, title, year

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  // Filters against ItemCopy fields (via the copies relation)
  @IsOptional()
  @IsString()
  itemTypeCode?: string;

  @IsOptional()
  @IsString()
  libraryCode?: string; // matches ItemCopy.homeLibraryCode

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  accessionNumber?: string;
}
