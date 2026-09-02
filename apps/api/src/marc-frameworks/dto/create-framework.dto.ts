import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFrameworkDto {
  @IsNotEmpty()
  @IsString()
  code: string; // e.g. DEFAULT, SERIAL, THESIS, MANUSCRIPT

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  materialType?: string; // matches BibliographicRecord.format value(s) this framework applies to

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
