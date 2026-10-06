import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LinkHeadingDto {
  @IsString()
  @IsNotEmpty()
  bibRecordId: string;

  @IsString()
  @IsNotEmpty()
  authorityId: string;

  @IsString()
  @IsNotEmpty()
  tag: string;

  @IsString()
  @IsOptional()
  subfield?: string;
}
