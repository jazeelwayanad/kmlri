import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxBorrowLimit?: number;

  @IsOptional()
  @IsString()
  permissions?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  membershipNumber?: string;
}
