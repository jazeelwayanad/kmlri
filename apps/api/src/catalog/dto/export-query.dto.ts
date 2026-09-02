import { IsIn, IsOptional, IsString } from 'class-validator';

export class ExportQueryDto {
  @IsOptional()
  @IsIn(['marcxml', 'csv'])
  format?: 'marcxml' | 'csv';

  // Comma-separated bibRecordIds. If omitted, exports the whole catalogue
  // (capped at EXPORT_SAFETY_CAP records — see CatalogService.exportRecords).
  @IsOptional()
  @IsString()
  ids?: string;
}
