import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('shortlinks/:shortlinkId/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(
    @Param('shortlinkId') shortlinkId: string,
    @Request() req: any,
  ): Promise<any> {
    return this.analyticsService.getOverview(shortlinkId, req.user.userId);
  }

  @Get('devices')
  async getDeviceStats(
    @Param('shortlinkId') shortlinkId: string,
    @Request() req: any,
  ): Promise<any> {
    return this.analyticsService.getDeviceStats(shortlinkId, req.user.userId);
  }

  @Get('countries')
  async getCountryStats(
    @Param('shortlinkId') shortlinkId: string,
    @Request() req: any,
  ): Promise<any> {
    return this.analyticsService.getCountryStats(shortlinkId, req.user.userId);
  }

  @Get('timeline')
  async getTimeStats(
    @Param('shortlinkId') shortlinkId: string,
    @Query('days') days: string,
    @Request() req: any,
  ): Promise<any> {
    const daysNumber = parseInt(days) || 30;
    return this.analyticsService.getTimeStats(
      shortlinkId,
      req.user.userId,
      daysNumber,
    );
  }
}
