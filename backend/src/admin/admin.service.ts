import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { VideoSyncJob } from '../entities/video-sync-job.entity';
import { ConnectedAccount } from '../entities/connected-account.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(VideoSyncJob)
    private jobRepo: Repository<VideoSyncJob>,
    @InjectRepository(ConnectedAccount)
    private accountRepo: Repository<ConnectedAccount>,
  ) {}

  async getSystemStats() {
    const [totalUsers, activeAccounts, totalJobs] = await Promise.all([
      this.userRepo.count(),
      this.accountRepo.count({ where: { isActive: true } }),
      this.jobRepo.count(),
    ]);

    const completedJobs = await this.jobRepo.count({ where: { status: 'completed' as any } });
    const failedJobs = await this.jobRepo.count({ where: { status: 'failed' as any } });
    const pendingJobs = await this.jobRepo.count({ where: { status: 'pending' as any } });

    // Get active users (users with activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.connectedAccounts', 'account')
      .where('account.updatedAt > :date', { date: thirtyDaysAgo })
      .getCount();

    return {
      totalUsers,
      activeUsers,
      totalJobs,
      completedJobs,
      failedJobs,
      pendingJobs,
      activeAccounts,
      timestamp: new Date().toISOString(),
    };
  }

  async getUsers(page: number = 1, limit: number = 20) {
    const [users, total] = await this.userRepo.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
      relations: ['connectedAccounts'],
    });

    return {
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        connectedAccounts: user.connectedAccounts?.length || 0,
        isActive: user.isActive,
        createdAt: user.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getJobs(status?: string) {
    const where = status ? { status: status as any } : {};
    
    const jobs = await this.jobRepo.find({
      where,
      take: 50,
      order: { createdAt: 'DESC' },
      relations: ['user', 'youtubeChannel'],
    });

    return jobs.map(job => ({
      id: job.id,
      userId: job.userId,
      userEmail: job.user?.email || 'N/A',
      title: job.title,
      status: job.status,
      uploadStatuses: job.uploadStatuses,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }));
  }

  async getLogs(level?: string, limit: number = 50) {
    // In production, this would query a logging service or database table
    // For now, return mock data structure
    return {
      logs: [
        {
          id: '1',
          level: level || 'info',
          message: 'System operational',
          timestamp: new Date().toISOString(),
          metadata: {},
        },
      ],
      note: 'Connect to logging service (e.g., CloudWatch, Elasticsearch) for production logs',
    };
  }
}

