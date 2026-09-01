import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReturnBookDto {
  @IsNotEmpty()
  @IsString()
  barcodeOrRfid: string;

  @IsOptional()
  @IsString()
  conditionNote?: string;
}

export class RenewBookDto {
  @IsNotEmpty()
  @IsString()
  loanId: string;
}
