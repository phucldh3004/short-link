import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '../common/services/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private firebaseService: FirebaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    // Kiểm tra email đã tồn tại
    const existingUsers = await this.firebaseService.findWhere<User>(
      'users',
      'email',
      email,
    );
    if (existingUsers.length > 0) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password
    const saltRounds =
      this.configService.get<number>('bcrypt.saltRounds') || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tạo user mới
    const userData = {
      email,
      password: hashedPassword,
      name,
    };

    const userId = await this.firebaseService.create<User>('users', userData);

    // Tạo JWT token
    const payload = { email, sub: userId };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: userId,
        email,
        name,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Tìm user
    const users = await this.firebaseService.findWhere<User>(
      'users',
      'email',
      email,
    );
    if (users.length === 0) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const user = users[0];

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Tạo JWT token
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id || '',
        email: user.email,
        name: user.name,
      },
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.firebaseService.findById<User>('users', userId);
  }
}
