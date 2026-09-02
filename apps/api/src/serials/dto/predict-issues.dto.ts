import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PredictIssuesDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(52)
  count?: number;
}
