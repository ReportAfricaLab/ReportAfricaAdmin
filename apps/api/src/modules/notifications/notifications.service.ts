import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, NotificationEntity } from '../../database/entities';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly fcmServerKey: string;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {
    this.fcmServerKey = this.config.get('FCM_SERVER_KEY', '');
  }

  async sendToUser(userId: string, payload: NotificationPayload) {
    // Persist to DB
    await this.notificationRepo.save(this.notificationRepo.create({
      userId,
      title: payload.title,
      body: payload.body,
      type: payload.data?.type || 'general',
      data: payload.data || {},
    }));

    // Send push
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user?.fcmToken) return;
    return this.sendToToken(user.fcmToken, payload);
  }

  async sendToCountry(country: string, payload: NotificationPayload) {
    const users = await this.userRepo.find({ where: { country }, select: ['fcmToken'] });
    const tokens = users.map((u) => u.fcmToken).filter(Boolean);
    if (tokens.length === 0) return;
    for (let i = 0; i < tokens.length; i += 500) {
      await this.sendToTokens(tokens.slice(i, i + 500), payload);
    }
  }

  async sendNearbyAlert(latitude: number, longitude: number, radiusKm: number, payload: NotificationPayload) {
    const radiusDegrees = radiusKm / 111;
    const users = await this.userRepo
      .createQueryBuilder('user')
      .where('user.latitude BETWEEN :minLat AND :maxLat', { minLat: latitude - radiusDegrees, maxLat: latitude + radiusDegrees })
      .andWhere('user.longitude BETWEEN :minLng AND :maxLng', { minLng: longitude - radiusDegrees, maxLng: longitude + radiusDegrees })
      .andWhere('user.fcmToken IS NOT NULL')
      .getMany();

    const tokens = users.map((u) => u.fcmToken).filter(Boolean);
    if (tokens.length > 0) await this.sendToTokens(tokens, payload);
  }

  // === HISTORY ===

  async getHistory(userId: string, page = 1, limit = 30) {
    const [data, total] = await this.notificationRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const unreadCount = await this.notificationRepo.count({ where: { userId, isRead: false } });
    return { data, unreadCount, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async markAsRead(notificationId: string, userId: string) {
    await this.notificationRepo.update({ id: notificationId, userId }, { isRead: true });
    return { read: true };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
    return { read: true };
  }

  private async sendToToken(token: string, payload: NotificationPayload) {
    return this.sendToTokens([token], payload);
  }

  private async sendToTokens(tokens: string[], payload: NotificationPayload) {
    if (!this.fcmServerKey) return;
    try {
      await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: { 'Authorization': `key=${this.fcmServerKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_ids: tokens,
          notification: { title: payload.title, body: payload.body },
          data: payload.data || {},
        }),
      });
    } catch (error) {
      this.logger.error('FCM send failed', error);
    }
  }
}
