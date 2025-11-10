import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getSystemStats();
  }

  @Get('users')
  async getUsers(@Query('page') page: string, @Query('limit') limit: string) {
    return this.adminService.getUsers(parseInt(page) || 1, parseInt(limit) || 20);
  }

  @Get('jobs')
  async getJobs(@Query('status') status: string) {
    return this.adminService.getJobs(status);
  }

  @Get('logs')
  async getLogs(@Query('level') level: string, @Query('limit') limit: string) {
    return this.adminService.getLogs(level, parseInt(limit) || 50);
  }
}

