import { Module, forwardRef } from '@nestjs/common';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { CommonModule } from '../common/common.module';
import { ShortlinkModule } from '../shortlink/shortlink.module';

@Module({
  imports: [CommonModule, forwardRef(() => ShortlinkModule)],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
