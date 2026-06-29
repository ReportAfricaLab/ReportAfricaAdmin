import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface SplitPaymentParams {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  reference: string;
  reporterBankAccount: { bankCode: string; accountNumber: string; accountName: string };
  platformSplitPercent: number; // e.g. 50
  metadata?: Record<string, any>;
}

interface KoraResponse {
  status: boolean;
  message: string;
  data: any;
}

@Injectable()
export class KoraPayService {
  private readonly logger = new Logger(KoraPayService.name);
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly baseUrl = 'https://api.korapay.com/merchant/api/v1';

  constructor(private readonly config: ConfigService) {
    this.secretKey = this.config.get('KORAPAY_SECRET_KEY', '');
    this.publicKey = this.config.get('KORAPAY_PUBLIC_KEY', '');
  }

  async initializeSplitPayment(params: SplitPaymentParams): Promise<KoraResponse> {
    const platformAmount = Math.round(params.amount * (params.platformSplitPercent / 100));
    const reporterAmount = params.amount - platformAmount;

    const payload = {
      amount: params.amount,
      currency: params.currency,
      reference: params.reference,
      customer: { email: params.customerEmail, name: params.customerName },
      notification_url: this.config.get('KORAPAY_WEBHOOK_URL', ''),
      redirect_url: this.config.get('KORAPAY_REDIRECT_URL', ''),
      metadata: {
        ...params.metadata,
        reporterAmount,
        platformAmount,
      },
      split: {
        type: 'percentage',
        subaccounts: [
          {
            bank_account: {
              bank: params.reporterBankAccount.bankCode,
              account: params.reporterBankAccount.accountNumber,
              account_name: params.reporterBankAccount.accountName,
            },
            percentage: 100 - params.platformSplitPercent,
          },
        ],
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/charges/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      this.logger.log(`Kora Pay initialized: ${params.reference} - ${data.status}`);
      return data;
    } catch (error) {
      this.logger.error('Kora Pay initialization failed', error);
      return { status: false, message: 'Payment initialization failed', data: null };
    }
  }

  async verifyTransaction(reference: string): Promise<KoraResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/charges/${reference}`, {
        headers: { 'Authorization': `Bearer ${this.secretKey}` },
      });
      return response.json();
    } catch (error) {
      this.logger.error('Kora Pay verification failed', error);
      return { status: false, message: 'Verification failed', data: null };
    }
  }

  validateWebhook(body: string, signature: string): boolean {
    const hash = crypto.createHmac('sha256', this.secretKey).update(body).digest('hex');
    return hash === signature;
  }

  generateReference(): string {
    return `RA_LIC_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  // Simple collection (no split) — used as fallback when Paystack fails
  async initializePayment(params: { amount: number; currency: string; email: string; reference: string; metadata?: Record<string, any>; redirectUrl?: string }): Promise<KoraResponse> {
    const payload = {
      amount: params.amount,
      currency: params.currency,
      reference: params.reference,
      customer: { email: params.email },
      notification_url: this.config.get('KORAPAY_WEBHOOK_URL', ''),
      redirect_url: params.redirectUrl || this.config.get('KORAPAY_REDIRECT_URL', ''),
      metadata: params.metadata,
    };

    try {
      const response = await fetch(`${this.baseUrl}/charges/initialize`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.secretKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      this.logger.log(`Kora Pay collection initialized: ${params.reference} - ${data.status}`);
      return data;
    } catch (error) {
      this.logger.error('Kora Pay collection failed', error);
      return { status: false, message: 'Payment initialization failed', data: null };
    }
  }
}
