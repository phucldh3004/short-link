import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
  UseGuards,
  Request,
  Put,
  Delete,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShortlinkService } from './shortlink.service';
import { CreateShortlinkDto } from './dto/create-shortlink.dto';
import { UpdateShortlinkDto } from './dto/update-shortlink.dto';
import { AnalyticsService } from '../analytics/analytics.service';

@Controller('shortlinks')
export class ShortlinkController {
  constructor(
    private readonly shortlinkService: ShortlinkService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createShortlinkDto: CreateShortlinkDto,
    @Request() req: any,
  ) {
    return this.shortlinkService.create(createShortlinkDto, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any) {
    return this.shortlinkService.findAll(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.shortlinkService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateShortlinkDto: UpdateShortlinkDto,
    @Request() req: any,
  ) {
    return this.shortlinkService.update(
      id,
      updateShortlinkDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.shortlinkService.remove(id, req.user.userId);
  }

  @Get('s/:code')
  async redirectToTargetUrl(
    @Param('code') code: string,
    @Res() res: Response,
    @Request() req: any,
  ) {
    try {
      const shortlink = await this.shortlinkService.findByCode(code);
      if (shortlink.id) {
        await this.shortlinkService.incrementClicks(shortlink.id);

        // Log analytics
        await this.analyticsService.logAccess(
          shortlink.id,
          req.ip || 'unknown',
          req.headers['user-agent'],
          req.headers.referer,
        );
      }

      // Lấy target URL với schedule (nếu có)
      const targetUrl =
        await this.shortlinkService.getTargetUrlWithSchedule(shortlink);
      return res.redirect(targetUrl);
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'Shortlink không tồn tại hoặc đã hết hạn',
      });
    }
  }
}
