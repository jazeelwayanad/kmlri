import { IsOptional, IsString } from 'class-validator';

export class DuplicateQueryDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsString()
  issn?: string;
}
