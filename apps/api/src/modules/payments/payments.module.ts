import { Module } from '@nestjs/common';
import { KoraPayService } from './korapay.service';
import { CurrencyConversionService } from './currency-conversion.service';

@Module({
  providers: [KoraPayService, CurrencyConversionService],
  exports: [KoraPayService, CurrencyConversionService],
})
export class PaymentsModule {}
