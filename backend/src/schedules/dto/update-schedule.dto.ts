import { IsUrl, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateScheduleDto {
  @IsOptional()
  @IsUrl()
  targetUrl?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
