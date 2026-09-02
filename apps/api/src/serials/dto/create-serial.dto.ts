import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

// periodicityCode drives the prediction engine — must be one of the codes the
// engine maps in serials.service.ts. IRREGULAR disables auto-prediction.
export const PERIODICITY_CODES = [
  'DAILY',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'BIMONTHLY',
  'QUARTERLY',
  'SEMIANNUAL',
  'ANNUAL',
  'IRREGULAR',
] as const;

export class CreateSerialDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  shelfmark?: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsIn(PERIODICITY_CODES as unknown as string[])
  periodicityCode?: string;

  // JSON string: { unit: "issue"|"volume", format: string, startVolume?: number, startNumber?: number }
  @IsOptional()
  @IsString()
  numberingPattern?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  bibRecordId?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  libraryId?: string;

  @IsOptional()
  @IsString()
  locationCode?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'EXPIRED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  renewalNote?: string;
}
