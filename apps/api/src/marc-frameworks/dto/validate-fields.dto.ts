import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MarcFieldValueDto {
  @IsNotEmpty()
  @IsString()
  tag: string;

  @IsOptional()
  @IsString()
  subfield?: string;

  @IsOptional()
  @IsString()
  value?: string;
}

export class ValidateFieldsDto {
  @IsNotEmpty()
  @IsString()
  frameworkCode: string;

  @IsArray()
  entries: MarcFieldValueDto[];
}
