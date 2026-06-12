import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, ReportEntity, CampaignEntity, MediaLicenseEntity, EarningsEntity } from '../../database/entities';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminGuard } from '../../common/guards/admin.guard';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ReportEntity, CampaignEntity, MediaLicenseEntity, EarningsEntity]),
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}
