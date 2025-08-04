import { Module } from '@nestjs/common';
import { PasswordsController } from './passwords.controller';
import { PasswordsService } from './passwords.service';
import { CommonModule } from '../common/common.module';
import { ShortlinkModule } from '../shortlink/shortlink.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CommonModule, ShortlinkModule, ConfigModule],
  controllers: [PasswordsController],
  providers: [PasswordsService],
  exports: [PasswordsService],
})
export class PasswordsModule {}
