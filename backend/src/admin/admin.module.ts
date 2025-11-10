import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, VideoSyncJob, ConnectedAccount } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, VideoSyncJob, ConnectedAccount])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

