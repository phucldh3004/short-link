import { IsUrl, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class UpdateShortlinkDto {
  @IsOptional()
  @IsUrl()
  targetUrl?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
