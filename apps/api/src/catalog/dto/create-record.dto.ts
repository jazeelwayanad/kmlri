import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRecordDto {
  @IsOptional()
  @IsString()
  titleArabic?: string;

  @IsNotEmpty()
  @IsString()
  titleLatin: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  statementOfResponsibility?: string;

  @IsNotEmpty()
  @IsArray()
  authors: string[];

  @IsOptional()
  @IsString()
  scribe?: string;

  @IsNotEmpty()
  @IsString()
  shelfmark: string;

  @IsOptional()
  @IsString()
  callNumber?: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsString()
  issn?: string;

  @IsOptional()
  @IsString()
  doi?: string;

  @IsOptional()
  @IsString()
  format?: string; // MANUSCRIPT, ARABI_MALAYALAM_PRINT, RARE_BOOK, PERIODICAL, THESIS, AUDIO

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  publicationYear?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsString()
  placeOfPublication?: string;

  @IsOptional()
  @IsString()
  edition?: string;

  @IsOptional()
  @IsString()
  series?: string;

  @IsOptional()
  @IsString()
  extent?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  binding?: string;

  @IsOptional()
  @IsString()
  provenance?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  subjects?: string[];

  @IsOptional()
  @IsString()
  accessLevel?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  collectionId?: string;

  @IsOptional()
  initialCopiesCount?: number;

  @IsOptional()
  @IsString()
  initialLocation?: string;
}
