import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { ConfigService } from '@nestjs/config';
import { Shortlink } from './shortlink.entity';
import { CreateShortlinkDto } from './dto/create-shortlink.dto';
import { UpdateShortlinkDto } from './dto/update-shortlink.dto';
import { FirebaseService } from '../common/services/firebase.service';
import { SchedulesService } from '../schedules/schedules.service';

@Injectable()
export class ShortlinkService {
  constructor(
    private firebaseService: FirebaseService,
    private configService: ConfigService,
    @Inject(forwardRef(() => SchedulesService))
    private schedulesService: SchedulesService,
  ) {}

  async create(
    createShortlinkDto: CreateShortlinkDto,
    userId: string,
  ): Promise<Shortlink> {
    const codeLength =
      this.configService.get<number>('shortlink.codeLength') || 6;
    const shortlinkData = {
      ...createShortlinkDto,
      code: nanoid(codeLength),
      userId,
      clicks: 0,
      isActive: true,
      expiresAt: createShortlinkDto.expiresAt
        ? new Date(createShortlinkDto.expiresAt)
        : null,
    };

    const shortlinkId = await this.firebaseService.create<Shortlink>(
      'shortlinks',
      shortlinkData,
    );
    const createdShortlink = await this.firebaseService.findById<Shortlink>(
      'shortlinks',
      shortlinkId,
    );
    if (!createdShortlink) {
      throw new Error('Không thể tạo shortlink');
    }
    return createdShortlink;
  }

  async findAll(userId: string): Promise<Shortlink[]> {
    return this.firebaseService.findWhere<Shortlink>(
      'shortlinks',
      'userId',
      userId,
    );
  }

  async findOne(id: string, userId: string): Promise<Shortlink> {
    const shortlink = await this.firebaseService.findById<Shortlink>(
      'shortlinks',
      id,
    );

    if (!shortlink) {
      throw new NotFoundException('Shortlink không tồn tại');
    }

    if (shortlink.userId !== userId) {
      throw new ForbiddenException('Không có quyền truy cập shortlink này');
    }

    return shortlink;
  }

  async findByCode(code: string): Promise<Shortlink> {
    const shortlinks = await this.firebaseService.findWhere<Shortlink>(
      'shortlinks',
      'code',
      code,
    );

    if (shortlinks.length === 0) {
      throw new NotFoundException(
        'Shortlink không tồn tại hoặc đã bị vô hiệu hóa',
      );
    }

    const shortlink = shortlinks[0];

    if (!shortlink.isActive) {
      throw new NotFoundException('Shortlink đã bị vô hiệu hóa');
    }

    // Kiểm tra hết hạn
    if (shortlink.expiresAt && shortlink.expiresAt < new Date()) {
      throw new NotFoundException('Shortlink đã hết hạn');
    }

    return shortlink;
  }

  async update(
    id: string,
    updateShortlinkDto: UpdateShortlinkDto,
    userId: string,
  ): Promise<Shortlink> {
    const shortlink = await this.findOne(id, userId);

    const updateData: any = { ...updateShortlinkDto };
    if (updateShortlinkDto.expiresAt) {
      updateData.expiresAt = new Date(updateShortlinkDto.expiresAt);
    }

    await this.firebaseService.update('shortlinks', id, updateData);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId); // Kiểm tra quyền sở hữu
    await this.firebaseService.delete('shortlinks', id);
  }

  async incrementClicks(id: string): Promise<void> {
    await this.firebaseService.increment('shortlinks', id, 'clicks', 1);
  }

  // Lấy target URL với schedule (nếu có)
  async getTargetUrlWithSchedule(shortlink: Shortlink): Promise<string> {
    // Kiểm tra schedule hiện tại
    if (shortlink.id) {
      const currentSchedule = await this.schedulesService.getCurrentSchedule(
        shortlink.id,
      );

      if (currentSchedule) {
        return currentSchedule.targetUrl;
      }
    }

    return shortlink.targetUrl;
  }
}
