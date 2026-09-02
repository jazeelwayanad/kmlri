import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LinkHeadingDto {
  @IsNotEmpty()
  @IsString()
  bibRecordId: string;

  @IsNotEmpty()
  @IsString()
  authorityId: string;

  @IsNotEmpty()
  @IsString()
  tag: string;

  @IsOptional()
  @IsString()
  subfield?: string;
}
