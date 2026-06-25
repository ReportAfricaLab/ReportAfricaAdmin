import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { TripEntity } from '../../database/entities/trip.entity';
import { ReportEntity, UserEntity } from '../../database/entities';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([TripEntity, ReportEntity, UserEntity]), RealtimeModule],
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
