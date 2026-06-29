import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface InitializePaymentParams {
  email: string;
  amount: number; // in kobo (NGN) or pesewas (GHS)
  currency: string;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data: any;
}

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(private readonly config: ConfigService) {
    this.secretKey = this.config.get('PAYSTACK_SECRET_KEY', '');
  }

  async initializePayment(params: InitializePaymentParams): Promise<PaystackResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: params.email,
          amount: params.amount,
          currency: params.currency,
          reference: params.reference,
          callback_url: params.callbackUrl || this.config.get('PAYSTACK_CALLBACK_URL', ''),
          metadata: params.metadata,
        }),
      });

      const data = await response.json();
      this.logger.log(`Payment initialized: ${params.reference} - ${data.status}`);

      // If Paystack fails, return failed status (caller handles fallback)
      if (!data.status) {
        this.logger.warn(`Paystack failed for ${params.reference}: ${data.message}`);
      }
      return data;
    } catch (error) {
      this.logger.error(`Paystack request failed for ${params.reference}`, error);
      return { status: false, message: 'Paystack unavailable', data: null };
    }
  }

  async verifyPayment(reference: string): Promise<PaystackResponse> {
    const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
      headers: { 'Authorization': `Bearer ${this.secretKey}` },
    });

    const data = await response.json();
    this.logger.log(`Payment verified: ${reference} - status: ${data.data?.status}`);
    return data;
  }

  validateWebhook(body: string, signature: string): boolean {
    const hash = crypto.createHmac('sha512', this.secretKey).update(body).digest('hex');
    return hash === signature;
  }

  generateReference(): string {
    return `RA_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }
}
