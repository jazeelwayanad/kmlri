import { IsOptional, IsString } from 'class-validator';

export class CheckInIssueDto {
  @IsOptional()
  @IsString()
  receivedDate?: string;

  @IsOptional()
  @IsString()
  volume?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  bindingNote?: string;
}
