import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateIssueStatusDto {
  @IsNotEmpty()
  @IsIn(['MISSING', 'LATE'])
  status: 'MISSING' | 'LATE';
}
