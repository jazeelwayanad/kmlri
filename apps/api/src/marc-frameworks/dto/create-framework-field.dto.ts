import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateFrameworkFieldDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 3, { message: 'tag must be exactly 3 characters, e.g. "245"' })
  tag: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z]$/, { message: 'subfield must be a single lowercase letter, or omitted for control fields' })
  subfield?: string;

  @IsNotEmpty()
  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  mappedField?: string;

  @IsOptional()
  @IsBoolean()
  mandatory?: boolean;

  @IsOptional()
  @IsBoolean()
  repeatable?: boolean;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @IsOptional()
  @IsString()
  defaultValue?: string;

  @IsOptional()
  @IsString()
  authorisedValueCategory?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
