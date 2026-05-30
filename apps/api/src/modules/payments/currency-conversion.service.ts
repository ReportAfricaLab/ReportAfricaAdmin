import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const KORA_SUPPORTED = ['NGN', 'KES', 'GHS', 'ZAR', 'XAF', 'XOF', 'EGP'];

@Injectable()
export class CurrencyConversionService {
  private readonly logger = new Logger(CurrencyConversionService.name);
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.korapay.com/merchant/api/v1';

  constructor(
    private readonly config: ConfigService,
    @Optional() @Inject(CACHE_MANAGER) private readonly cache?: Cache,
  ) {
    this.secretKey = this.config.get('KORAPAY_SECRET_KEY', '');
  }

  isSupported(from: string, to: string): boolean {
    if (from === to) return true;
    return KORA_SUPPORTED.includes(from) && KORA_SUPPORTED.includes(to);
  }

  async getRate(from: string, to: string): Promise<number> {
    if (from === to) return 1;

    const cacheKey = `fx_rate:${from}:${to}`;
    if (this.cache) {
      const cached = await this.cache.get<number>(cacheKey);
      if (cached) return cached;
    }

    if (!this.secretKey || this.secretKey === 'your_secret_key') {
      // Dev mode — use approximate rates
      const rate = this.getApproxRate(from, to);
      if (this.cache) await this.cache.set(cacheKey, rate, 300000);
      return rate;
    }

    try {
      const response = await fetch(`${this.baseUrl}/misc/currency-conversion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to, amount: 1 }),
      });

      const data = await response.json();
      const rate = data.data?.rate || this.getApproxRate(from, to);

      if (this.cache) await this.cache.set(cacheKey, rate, 300000); // 5 min cache
      return rate;
    } catch (error) {
      this.logger.error(`Currency conversion failed: ${from} → ${to}`, error);
      return this.getApproxRate(from, to);
    }
  }

  async convert(amount: number, from: string, to: string): Promise<{ convertedAmount: number; rate: number }> {
    const rate = await this.getRate(from, to);
    const convertedAmount = Math.round(amount * rate);
    return { convertedAmount, rate };
  }

  // Fallback approximate rates (USD-based cross calculation)
  private getApproxRate(from: string, to: string): number {
    const toUSD: Record<string, number> = {
      NGN: 1 / 1500, GHS: 1 / 14, KES: 1 / 150, ZAR: 1 / 18,
      UGX: 1 / 3700, RWF: 1 / 1300, TZS: 1 / 2600, ETB: 1 / 57,
      XOF: 1 / 600, XAF: 1 / 600, EGP: 1 / 48, MAD: 1 / 10,
      USD: 1,
    };

    const fromRate = toUSD[from] || 1 / 1500;
    const toRate = toUSD[to] || 1 / 1500;
    return fromRate / toRate;
  }
}
