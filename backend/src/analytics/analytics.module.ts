import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { CommonModule } from '../common/common.module';
import { ShortlinkModule } from '../shortlink/shortlink.module';

@Module({
  imports: [CommonModule, ShortlinkModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
