import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GovController } from './gov.controller';
import { GovService } from './gov.service';
import { UserEntity, ReportEntity, ElectionReportEntity, CampaignEntity } from '../../database/entities';
import { DonationsModule } from '../donations/donations.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ReportEntity, ElectionReportEntity, CampaignEntity]), DonationsModule, PaymentsModule],
  controllers: [GovController],
  providers: [GovService],
  exports: [GovService],
})
export class GovModule {}
