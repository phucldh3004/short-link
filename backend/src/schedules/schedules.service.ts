import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ShortlinkSchedule } from './schedule.interface';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { FirebaseService } from '../common/services/firebase.service';
import { ShortlinkService } from '../shortlink/shortlink.service';

@Injectable()
export class SchedulesService {
  constructor(
    private firebaseService: FirebaseService,
    @Inject(forwardRef(() => ShortlinkService))
    private shortlinkService: ShortlinkService,
  ) {}

  async create(
    shortlinkId: string,
    createScheduleDto: CreateScheduleDto,
    userId: string,
  ): Promise<ShortlinkSchedule> {
    // Kiểm tra quyền sở hữu shortlink
    await this.shortlinkService.findOne(shortlinkId, userId);

    const scheduleData = {
      shortlinkId,
      targetUrl: createScheduleDto.targetUrl,
      startTime: new Date(createScheduleDto.startTime),
      endTime: new Date(createScheduleDto.endTime),
      isActive: createScheduleDto.isActive ?? true,
    };

    const scheduleId = await this.firebaseService.create<ShortlinkSchedule>(
      'schedules',
      scheduleData,
    );
    const createdSchedule =
      await this.firebaseService.findById<ShortlinkSchedule>(
        'schedules',
        scheduleId,
      );

    if (!createdSchedule) {
      throw new Error('Không thể tạo schedule');
    }

    return createdSchedule;
  }

  async findAll(
    shortlinkId: string,
    userId: string,
  ): Promise<ShortlinkSchedule[]> {
    // Kiểm tra quyền sở hữu shortlink
    await this.shortlinkService.findOne(shortlinkId, userId);

    return this.firebaseService.findWhere<ShortlinkSchedule>(
      'schedules',
      'shortlinkId',
      shortlinkId,
    );
  }

  async findOne(
    id: string,
    shortlinkId: string,
    userId: string,
  ): Promise<ShortlinkSchedule> {
    // Kiểm tra quyền sở hữu shortlink
    await this.shortlinkService.findOne(shortlinkId, userId);

    const schedule = await this.firebaseService.findById<ShortlinkSchedule>(
      'schedules',
      id,
    );

    if (!schedule) {
      throw new NotFoundException('Schedule không tồn tại');
    }

    if (schedule.shortlinkId !== shortlinkId) {
      throw new ForbiddenException('Không có quyền truy cập schedule này');
    }

    return schedule;
  }

  async update(
    id: string,
    shortlinkId: string,
    updateScheduleDto: UpdateScheduleDto,
    userId: string,
  ): Promise<ShortlinkSchedule> {
    const schedule = await this.findOne(id, shortlinkId, userId);

    const updateData: any = { ...updateScheduleDto };
    if (updateScheduleDto.startTime) {
      updateData.startTime = new Date(updateScheduleDto.startTime);
    }
    if (updateScheduleDto.endTime) {
      updateData.endTime = new Date(updateScheduleDto.endTime);
    }

    await this.firebaseService.update('schedules', id, updateData);
    return this.findOne(id, shortlinkId, userId);
  }

  async remove(id: string, shortlinkId: string, userId: string): Promise<void> {
    await this.findOne(id, shortlinkId, userId); // Kiểm tra quyền sở hữu
    await this.firebaseService.delete('schedules', id);
  }

  // Lấy schedule hiện tại cho một shortlink
  async getCurrentSchedule(
    shortlinkId: string,
  ): Promise<ShortlinkSchedule | null> {
    const now = new Date();

    const schedules =
      await this.firebaseService.findWhereMultiple<ShortlinkSchedule>(
        'schedules',
        [
          { field: 'shortlinkId', operator: '==', value: shortlinkId },
          { field: 'isActive', operator: '==', value: true },
          { field: 'startTime', operator: '<=', value: now },
          { field: 'endTime', operator: '>=', value: now },
        ],
      );

    return schedules.length > 0 ? schedules[0] : null;
  }
}
