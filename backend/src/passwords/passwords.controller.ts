import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PasswordsService } from './passwords.service';
import { CreatePasswordDto } from './dto/create-password.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { ShortlinkPassword } from './password.interface';

@Controller('shortlinks/:shortlinkId/passwords')
export class PasswordsController {
  constructor(private readonly passwordsService: PasswordsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('shortlinkId') shortlinkId: string,
    @Body() createPasswordDto: CreatePasswordDto,
    @Request() req: any,
  ): Promise<ShortlinkPassword> {
    return this.passwordsService.create(
      shortlinkId,
      createPasswordDto,
      req.user.userId,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Param('shortlinkId') shortlinkId: string,
    @Request() req: any,
  ): Promise<ShortlinkPassword[]> {
    return this.passwordsService.findAll(shortlinkId, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('shortlinkId') shortlinkId: string,
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    return this.passwordsService.remove(id, shortlinkId, req.user.userId);
  }

  // Public endpoint để verify password
  @Post('verify')
  async verifyPassword(
    @Param('shortlinkId') shortlinkId: string,
    @Body() verifyPasswordDto: VerifyPasswordDto,
  ): Promise<{ success: boolean }> {
    const isValid = await this.passwordsService.verifyPassword(
      shortlinkId,
      verifyPasswordDto,
    );
    return { success: isValid };
  }

  // Public endpoint để kiểm tra xem có cần password không
  @Get('check')
  async checkPasswordProtection(
    @Param('shortlinkId') shortlinkId: string,
  ): Promise<{ hasPassword: boolean }> {
    const hasPassword =
      await this.passwordsService.hasPasswordProtection(shortlinkId);
    return { hasPassword };
  }
}
