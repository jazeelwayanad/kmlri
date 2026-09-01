import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class IssueBookDto {
  @IsNotEmpty()
  @IsString()
  barcodeOrRfid: string;

  @IsNotEmpty()
  @IsString()
  userMembershipOrEmail: string;

  @IsOptional()
  loanDurationDays?: number;
}
