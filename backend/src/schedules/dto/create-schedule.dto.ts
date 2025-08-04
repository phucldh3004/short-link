import { IsUrl, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateScheduleDto {
  @IsUrl()
  targetUrl: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
