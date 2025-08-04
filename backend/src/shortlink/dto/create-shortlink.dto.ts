import { IsUrl, IsOptional, IsDateString } from 'class-validator';

export class CreateShortlinkDto {
  @IsUrl()
  targetUrl: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
