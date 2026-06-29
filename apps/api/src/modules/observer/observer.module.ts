import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObserverEntity } from '../../database/entities/observer.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { ObserverController } from './observer.controller';
import { ObserverService } from './observer.service';
import { ObserverGuard } from './observer.guard';
import { DonationsModule } from '../donations/donations.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [TypeOrmModule.forFeature([ObserverEntity, UserEntity]), DonationsModule, PaymentsModule],
  controllers: [ObserverController],
  providers: [ObserverService, ObserverGuard],
  exports: [ObserverService, ObserverGuard],
})
export class ObserverModule {}
