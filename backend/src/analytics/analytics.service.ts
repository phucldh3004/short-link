import { Injectable } from '@nestjs/common';
import { AccessLog } from './access-log.interface';
import { FirebaseService } from '../common/services/firebase.service';
import { ShortlinkService } from '../shortlink/shortlink.service';
import * as geoip from 'geoip-lite';
import * as UAParser from 'user-agents';

@Injectable()
export class AnalyticsService {
  constructor(
    private firebaseService: FirebaseService,
    private shortlinkService: ShortlinkService,
  ) {}

  // Log access
  async logAccess(
    shortlinkId: string,
    ipAddress: string,
    userAgent?: string,
    referer?: string,
  ): Promise<void> {
    const userAgentParser = new UAParser(userAgent);
    const geo = geoip.lookup(ipAddress);

    const accessLogData: AccessLog = {
      shortlinkId,
      ipAddress,
      userAgent,
      referer,
      deviceType: this.getDeviceType(userAgentParser),
      browser: userAgentParser.getBrowser().name,
      os: userAgentParser.getOS().name,
      country: geo?.country,
      city: geo?.city,
      region: geo?.region,
      timezone: geo?.timezone,
    };

    await this.firebaseService.create<AccessLog>('access_logs', accessLogData);
  }

  // Lấy thống kê tổng quan
  async getOverview(shortlinkId: string, userId: string): Promise<any> {
    await this.shortlinkService.findOne(shortlinkId, userId);

    const logs = await this.firebaseService.findWhere<AccessLog>(
      'access_logs',
      'shortlinkId',
      shortlinkId,
    );

    const totalClicks = logs.length;
    const uniqueIPs = new Set(logs.map((log) => log.ipAddress)).size;

    // Thống kê theo thời gian (7 ngày gần nhất)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLogs = logs.filter(
      (log) => log.timestamp && new Date(log.timestamp) >= sevenDaysAgo,
    );

    // Thống kê theo thiết bị
    const deviceStats = this.getDeviceStatsFromLogs(logs);

    // Thống kê theo quốc gia
    const countryStats = this.getCountryStatsFromLogs(logs);

    return {
      totalClicks,
      uniqueVisitors: uniqueIPs,
      recentClicks: recentLogs.length,
      deviceStats,
      countryStats,
    };
  }

  // Lấy thống kê theo thiết bị
  async getDeviceStats(shortlinkId: string, userId: string): Promise<any> {
    await this.shortlinkService.findOne(shortlinkId, userId);

    const logs = await this.firebaseService.findWhere<AccessLog>(
      'access_logs',
      'shortlinkId',
      shortlinkId,
    );
    return this.getDeviceStatsFromLogs(logs);
  }

  // Lấy thống kê theo quốc gia
  async getCountryStats(shortlinkId: string, userId: string): Promise<any> {
    await this.shortlinkService.findOne(shortlinkId, userId);

    const logs = await this.firebaseService.findWhere<AccessLog>(
      'access_logs',
      'shortlinkId',
      shortlinkId,
    );
    return this.getCountryStatsFromLogs(logs);
  }

  // Lấy thống kê theo thời gian
  async getTimeStats(
    shortlinkId: string,
    userId: string,
    days: number = 30,
  ): Promise<any> {
    await this.shortlinkService.findOne(shortlinkId, userId);

    const logs = await this.firebaseService.findWhere<AccessLog>(
      'access_logs',
      'shortlinkId',
      shortlinkId,
    );

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const filteredLogs = logs.filter(
      (log) => log.timestamp && new Date(log.timestamp) >= startDate,
    );

    // Nhóm theo ngày
    const dailyStats = {};
    filteredLogs.forEach((log) => {
      if (log.timestamp) {
        const date = new Date(log.timestamp).toISOString().split('T')[0];
        dailyStats[date] = (dailyStats[date] || 0) + 1;
      }
    });

    return dailyStats;
  }

  // Helper methods
  private getDeviceType(userAgentParser: UAParser): string {
    const device = userAgentParser.getDevice();
    if (device.type === 'mobile') return 'Mobile';
    if (device.type === 'tablet') return 'Tablet';
    return 'Desktop';
  }

  private getDeviceStatsFromLogs(logs: AccessLog[]): any {
    const stats = {};
    logs.forEach((log) => {
      const deviceType = log.deviceType || 'Unknown';
      stats[deviceType] = (stats[deviceType] || 0) + 1;
    });
    return stats;
  }

  private getCountryStatsFromLogs(logs: AccessLog[]): any {
    const stats = {};
    logs.forEach((log) => {
      const country = log.country || 'Unknown';
      stats[country] = (stats[country] || 0) + 1;
    });
    return stats;
  }
}
