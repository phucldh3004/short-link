import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req: any): Promise<Partial<User>> {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new Error('User không tồn tại');
    }

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Put('profile')
  async updateProfile(
    @Request() req: any,
    @Body() updateData: Partial<User>,
  ): Promise<Partial<User>> {
    const { password: _password, ...updateDataWithoutPassword } = updateData;
    const updatedUser = await this.usersService.updateProfile(
      req.user.userId,
      updateDataWithoutPassword,
    );

    const { password: _updatedPassword, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
