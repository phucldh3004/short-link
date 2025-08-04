import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ShortlinkController } from './shortlink.controller';
import { ShortlinkService } from './shortlink.service';
import { CommonModule } from '../common/common.module';
import { SchedulesModule } from '../schedules/schedules.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule,
    forwardRef(() => SchedulesModule),
    AnalyticsModule,
  ],
  controllers: [ShortlinkController],
  providers: [ShortlinkService],
  exports: [ShortlinkService],
})
export class ShortlinkModule {}
