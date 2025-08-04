import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Put,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ShortlinkSchedule } from './schedule.interface';

@Controller('shortlinks/:shortlinkId/schedules')
@UseGuards(JwtAuthGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  async create(
    @Param('shortlinkId') shortlinkId: string,
    @Body() createScheduleDto: CreateScheduleDto,
    @Request() req: any,
  ): Promise<ShortlinkSchedule> {
    return this.schedulesService.create(
      shortlinkId,
      createScheduleDto,
      req.user.userId,
    );
  }

  @Get()
  async findAll(
    @Param('shortlinkId') shortlinkId: string,
    @Request() req: any,
  ): Promise<ShortlinkSchedule[]> {
    return this.schedulesService.findAll(shortlinkId, req.user.userId);
  }

  @Get(':id')
  async findOne(
    @Param('shortlinkId') shortlinkId: string,
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ShortlinkSchedule> {
    return this.schedulesService.findOne(id, shortlinkId, req.user.userId);
  }

  @Put(':id')
  async update(
    @Param('shortlinkId') shortlinkId: string,
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Request() req: any,
  ): Promise<ShortlinkSchedule> {
    return this.schedulesService.update(
      id,
      shortlinkId,
      updateScheduleDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  async remove(
    @Param('shortlinkId') shortlinkId: string,
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    return this.schedulesService.remove(id, shortlinkId, req.user.userId);
  }
}
