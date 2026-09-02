import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateClaimDto {
  @IsNotEmpty()
  @IsIn(['RESPONDED', 'RESOLVED'])
  status: 'RESPONDED' | 'RESOLVED';

  @IsOptional()
  @IsString()
  notes?: string;
}
