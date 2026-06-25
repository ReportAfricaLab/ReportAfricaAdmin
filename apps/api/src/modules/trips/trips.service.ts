import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripEntity } from '../../database/entities/trip.entity';
import { ReportEntity } from '../../database/entities/report.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(TripEntity)
    private readonly tripRepo: Repository<TripEntity>,
    @InjectRepository(ReportEntity)
    private readonly reportRepo: Repository<ReportEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly realtime: RealtimeGateway,
  ) {}

  async start(userId: string, dto: { sharedWithUsername: string; latitude: number; longitude: number; destination?: string }) {
    const sharedWith = await this.userRepo.findOne({ where: { username: dto.sharedWithUsername } });
    if (!sharedWith) throw new BadRequestException('User not found. Check the username.');
    if (sharedWith.id === userId) throw new BadRequestException('Cannot share trip with yourself');

    // End any existing active trip
    await this.tripRepo.update({ userId, isActive: true }, { isActive: false, endedAt: new Date() });

    const trip = this.tripRepo.create({
      userId,
      sharedWithUserId: sharedWith.id,
      startLat: dto.latitude,
      startLng: dto.longitude,
      currentLat: dto.latitude,
      currentLng: dto.longitude,
      destination: dto.destination,
      isActive: true,
    });
    const saved = await this.tripRepo.save(trip);

    // Notify watcher via socket
    this.realtime.emitTripUpdate(sharedWith.id, { type: 'trip_started', tripId: saved.id, userId });

    return saved;
  }

  async updateLocation(userId: string, dto: { latitude: number; longitude: number }) {
    const trip = await this.tripRepo.findOne({ where: { userId, isActive: true } });
    if (!trip) throw new NotFoundException('No active trip');

    trip.currentLat = dto.latitude;
    trip.currentLng = dto.longitude;
    await this.tripRepo.save(trip);

    // Emit real-time update to watcher
    this.realtime.emitTripUpdate(trip.sharedWithUserId, {
      type: 'location_update',
      tripId: trip.id,
      latitude: dto.latitude,
      longitude: dto.longitude,
      timestamp: new Date().toISOString(),
    });

    return { updated: true };
  }

  async end(userId: string) {
    const trip = await this.tripRepo.findOne({ where: { userId, isActive: true } });
    if (!trip) throw new NotFoundException('No active trip');

    trip.isActive = false;
    trip.endedAt = new Date();
    await this.tripRepo.save(trip);

    this.realtime.emitTripUpdate(trip.sharedWithUserId, { type: 'trip_ended', tripId: trip.id });

    return { ended: true };
  }

  async getActive(userId: string) {
    return this.tripRepo.findOne({ where: { userId, isActive: true }, relations: ['sharedWithUser'] });
  }

  async getWatching(userId: string) {
    return this.tripRepo.find({ where: { sharedWithUserId: userId, isActive: true }, relations: ['user'] });
  }

  async getDangers(tripId: string, userId: string) {
    const trip = await this.tripRepo.findOne({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.userId !== userId && trip.sharedWithUserId !== userId) throw new BadRequestException('Not authorized');

    // Fetch reports within 5km of current position, last 24 hours
    const radius = 5 / 111;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const dangers = await this.reportRepo.createQueryBuilder('r')
      .where('r.latitude BETWEEN :minLat AND :maxLat', { minLat: trip.currentLat - radius, maxLat: Number(trip.currentLat) + radius })
      .andWhere('r.longitude BETWEEN :minLng AND :maxLng', { minLng: trip.currentLng - radius, maxLng: Number(trip.currentLng) + radius })
      .andWhere('r.createdAt > :oneDayAgo', { oneDayAgo })
      .andWhere('r.severity IN (:...severities)', { severities: ['critical', 'high'] })
      .orderBy('r.createdAt', 'DESC')
      .take(10)
      .getMany();

    return dangers;
  }
}
