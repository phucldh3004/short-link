import {
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreatePasswordDto {
  @IsString()
  @MinLength(4)
  password: string;

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
