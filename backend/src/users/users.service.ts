import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { FirebaseService } from '../common/services/firebase.service';

@Injectable()
export class UsersService {
  constructor(private firebaseService: FirebaseService) {}

  async findById(id: string): Promise<User | null> {
    return this.firebaseService.findById<User>('users', id);
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.firebaseService.findWhere<User>(
      'users',
      'email',
      email,
    );
    return users.length > 0 ? users[0] : null;
  }

  async updateProfile(
    userId: string,
    updateData: Partial<User>,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    await this.firebaseService.update('users', userId, updateData);
    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw new NotFoundException('User không tồn tại');
    }
    return updatedUser;
  }
}
