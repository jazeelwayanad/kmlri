import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateIssueDto {
  @IsNotEmpty()
  @IsString()
  issueLabel: string;

  @IsOptional()
  @IsString()
  volume?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  publicationDate?: string;

  @IsOptional()
  @IsString()
  expectedDate?: string;

  @IsOptional()
  @IsBoolean()
  isSupplement?: boolean;

  @IsOptional()
  @IsBoolean()
  isIndex?: boolean;

  @IsOptional()
  @IsString()
  bindingNote?: string;
}
