import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async sendNotification(payload: NotificationPayload) {
    const { userId, type, title, message } = payload;

    // Send all notification types simultaneously
    await Promise.allSettled([
      this.sendInAppNotification(payload),
      this.sendEmailNotification(payload),
      this.sendPushNotification(payload),
    ]);

    this.logger.log(`Notification sent to user ${userId}: ${title}`);
  }

  private async sendInAppNotification(payload: NotificationPayload) {
    // TODO: Store in-app notifications in database
    // Create a Notification entity and save it
    this.logger.debug(`In-app notification: ${payload.title}`);
    
    // Placeholder: In production, this would:
    // 1. Save to notifications table
    // 2. Emit WebSocket event to connected clients
    return { success: true, channel: 'in-app' };
  }

  private async sendEmailNotification(payload: NotificationPayload) {
    const user = await this.userRepo.findOne({ where: { id: payload.userId } });
    if (!user || !user.email) {
      this.logger.warn(`User ${payload.userId} has no email`);
      return { success: false, channel: 'email' };
    }

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    this.logger.debug(`Email notification to ${user.email}: ${payload.title}`);
    
    // Placeholder: In production, this would use an email service
    // Example with SendGrid:
    // await this.sendgridService.send({
    //   to: user.email,
    //   subject: payload.title,
    //   text: payload.message,
    //   html: this.formatEmailTemplate(payload),
    // });
    
    return { success: true, channel: 'email', to: user.email };
  }

  private async sendPushNotification(payload: NotificationPayload) {
    // TODO: Integrate with push notification service (FCM, APNs via Capacitor)
    this.logger.debug(`Push notification: ${payload.title}`);
    
    // Placeholder: In production, this would:
    // 1. Get user's device tokens from database
    // 2. Send to FCM/APNs
    // Example:
    // await this.fcmService.send({
    //   token: userDeviceToken,
    //   notification: {
    //     title: payload.title,
    //     body: payload.message,
    //   },
    //   data: payload.metadata,
    // });
    
    return { success: true, channel: 'push' };
  }

  // Convenience methods for common notification scenarios
  async notifyVideoSyncSuccess(userId: string, videoTitle: string) {
    await this.sendNotification({
      userId,
      type: NotificationType.SUCCESS,
      title: 'Video Synced Successfully',
      message: `"${videoTitle}" has been uploaded to all connected platforms.`,
    });
  }

  async notifyVideoSyncError(userId: string, videoTitle: string, error: string) {
    await this.sendNotification({
      userId,
      type: NotificationType.ERROR,
      title: 'Video Sync Failed',
      message: `Failed to upload "${videoTitle}": ${error}`,
    });
  }

  async notifyTokenExpiring(userId: string, platform: string) {
    await this.sendNotification({
      userId,
      type: NotificationType.WARNING,
      title: 'Account Reconnection Needed',
      message: `Your ${platform} account needs to be reconnected. Please visit settings.`,
    });
  }

  async notifyNewVideoDetected(userId: string, videoTitle: string) {
    await this.sendNotification({
      userId,
      type: NotificationType.INFO,
      title: 'New Video Detected',
      message: `"${videoTitle}" is being processed for upload.`,
    });
  }
}

