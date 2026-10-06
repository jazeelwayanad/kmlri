import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateAuthorityDto {
  @IsString()
  @IsNotEmpty()
  headingType: string; // PERSONAL_NAME, CORPORATE_NAME, PUBLISHER, SUBJECT, SERIES, UNIFORM_TITLE

  @IsString()
  @IsNotEmpty()
  heading: string;

  @IsArray()
  @IsOptional()
  seeAlso?: string[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  marcXml?: string;

  @IsString()
  @IsOptional()
  customFields?: string;

  @IsBoolean()
  @IsOptional()
  force?: boolean;
}
