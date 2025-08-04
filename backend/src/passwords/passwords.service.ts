import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ShortlinkPassword } from './password.interface';
import { CreatePasswordDto } from './dto/create-password.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { FirebaseService } from '../common/services/firebase.service';
import { ShortlinkService } from '../shortlink/shortlink.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PasswordsService {
  constructor(
    private firebaseService: FirebaseService,
    private shortlinkService: ShortlinkService,
    private configService: ConfigService,
  ) {}

  async create(
    shortlinkId: string,
    createPasswordDto: CreatePasswordDto,
    userId: string,
  ): Promise<ShortlinkPassword> {
    // Kiểm tra quyền sở hữu shortlink
    await this.shortlinkService.findOne(shortlinkId, userId);

    // Hash password
    const saltRounds =
      this.configService.get<number>('bcrypt.saltRounds') || 10;
    const hashedPassword = await bcrypt.hash(
      createPasswordDto.password,
      saltRounds,
    );

    const passwordData = {
      shortlinkId,
      password: hashedPassword,
      startTime: createPasswordDto.startTime
        ? new Date(createPasswordDto.startTime)
        : null,
      endTime: createPasswordDto.endTime
        ? new Date(createPasswordDto.endTime)
        : null,
      isActive: createPasswordDto.isActive ?? true,
    };

    const passwordId = await this.firebaseService.create<ShortlinkPassword>(
      'passwords',
      passwordData,
    );
    const createdPassword =
      await this.firebaseService.findById<ShortlinkPassword>(
        'passwords',
        passwordId,
      );

    if (!createdPassword) {
      throw new Error('Không thể tạo password protection');
    }

    return createdPassword;
  }

  async findAll(
    shortlinkId: string,
    userId: string,
  ): Promise<ShortlinkPassword[]> {
    // Kiểm tra quyền sở hữu shortlink
    await this.shortlinkService.findOne(shortlinkId, userId);

    return this.firebaseService.findWhere<ShortlinkPassword>(
      'passwords',
      'shortlinkId',
      shortlinkId,
    );
  }

  async findOne(
    id: string,
    shortlinkId: string,
    userId: string,
  ): Promise<ShortlinkPassword> {
    // Kiểm tra quyền sở hữu shortlink
    await this.shortlinkService.findOne(shortlinkId, userId);

    const password = await this.firebaseService.findById<ShortlinkPassword>(
      'passwords',
      id,
    );

    if (!password) {
      throw new NotFoundException('Password protection không tồn tại');
    }

    if (password.shortlinkId !== shortlinkId) {
      throw new ForbiddenException(
        'Không có quyền truy cập password protection này',
      );
    }

    return password;
  }

  async remove(id: string, shortlinkId: string, userId: string): Promise<void> {
    await this.findOne(id, shortlinkId, userId); // Kiểm tra quyền sở hữu
    await this.firebaseService.delete('passwords', id);
  }

  // Verify password cho một shortlink
  async verifyPassword(
    shortlinkId: string,
    verifyPasswordDto: VerifyPasswordDto,
  ): Promise<boolean> {
    const now = new Date();

    const passwords =
      await this.firebaseService.findWhereMultiple<ShortlinkPassword>(
        'passwords',
        [
          { field: 'shortlinkId', operator: '==', value: shortlinkId },
          { field: 'isActive', operator: '==', value: true },
        ],
      );

    for (const password of passwords) {
      // Kiểm tra thời gian
      if (password.startTime && password.startTime > now) continue;
      if (password.endTime && password.endTime < now) continue;

      // Verify password
      const isValid = await bcrypt.compare(
        verifyPasswordDto.password,
        password.password,
      );
      if (isValid) {
        return true;
      }
    }

    return false;
  }

  // Kiểm tra xem shortlink có cần password không
  async hasPasswordProtection(shortlinkId: string): Promise<boolean> {
    const now = new Date();

    const passwords =
      await this.firebaseService.findWhereMultiple<ShortlinkPassword>(
        'passwords',
        [
          { field: 'shortlinkId', operator: '==', value: shortlinkId },
          { field: 'isActive', operator: '==', value: true },
        ],
      );

    for (const password of passwords) {
      // Kiểm tra thời gian
      if (password.startTime && password.startTime > now) continue;
      if (password.endTime && password.endTime < now) continue;

      return true;
    }

    return false;
  }
}
