import { IsOptional, IsString } from 'class-validator';

export class CreateClaimDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
