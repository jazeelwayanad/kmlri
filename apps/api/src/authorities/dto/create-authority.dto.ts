import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export const HEADING_TYPES = ['PERSONAL_NAME', 'CORPORATE_NAME', 'SUBJECT', 'SERIES', 'UNIFORM_TITLE'];

export class CreateAuthorityDto {
  @IsNotEmpty()
  @IsIn(HEADING_TYPES)
  headingType: string;

  @IsNotEmpty()
  @IsString()
  heading: string;

  @IsOptional()
  @IsArray()
  seeAlso?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  marcXml?: string;

  // When true, bypass the duplicate-heading check and create anyway.
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
