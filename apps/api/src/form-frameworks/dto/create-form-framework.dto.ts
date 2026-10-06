import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class FormFieldDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string; // Identifier / key, e.g. "title", "author", "isbn"

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  type: string; // text, textarea, number, select, multiselect, date, datetime, checkbox, radio, file, url, email, authority, record, member, collection

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsString()
  @IsOptional()
  defaultValue?: string;

  @IsOptional()
  options?: any; // array or JSON string

  @IsString()
  @IsOptional()
  visibility?: string; // PUBLIC, MEMBERS, ADMIN

  @IsBoolean()
  @IsOptional()
  multiplicity?: boolean; // repeatable entries

  @IsString()
  @IsOptional()
  referenceSource?: string; // e.g. AUTHOR, PUBLICATION, LIBRARY_RECORDS, MEMBERS, COLLECTIONS

  @IsBoolean()
  @IsOptional()
  showInTable?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class CreateFormFrameworkDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  recordType: string; // ITEM, SERIAL, AUTHORITY, MEMBER, COLLECTION

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields?: FormFieldDto[];
}
