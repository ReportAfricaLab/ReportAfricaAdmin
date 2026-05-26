import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignEntity, DonationEntity } from '../../database/entities';
import { PaystackService } from './paystack.service';
import { CreateCampaignDto, InitiateDonationDto } from './dto/donations.dto';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(CampaignEntity)
    private readonly campaignRepo: Repository<CampaignEntity>,
    @InjectRepository(DonationEntity)
    private readonly donationRepo: Repository<DonationEntity>,
    private readonly paystackService: PaystackService,
  ) {}

  // === CAMPAIGNS ===

  async createCampaign(authorId: string, country: string, dto: CreateCampaignDto): Promise<CampaignEntity> {
    const campaign = this.campaignRepo.create({
      ...dto,
      authorId,
      country,
      currency: dto.currency || 'NGN',
      media: dto.media || [],
      documents: dto.documents || [],
    });
    return this.campaignRepo.save(campaign);
  }

  async getCampaignById(id: string): Promise<CampaignEntity> {
    const campaign = await this.campaignRepo.findOne({ where: { id }, relations: ['author'] });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async getCampaignFeed(country: string, page = 1, limit = 20) {
    return this.campaignRepo.find({
      where: { country, isActive: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author'],
    });
  }

  async getEmergencyCampaigns(country: string) {
    return this.campaignRepo.find({
      where: { country, isActive: true, isEmergency: true },
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['author'],
    });
  }

  async getCampaignsByCategory(country: string, category: string, page = 1, limit = 20) {
    return this.campaignRepo.find({
      where: { country, category, isActive: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author'],
    });
  }

  // === DONATIONS ===

  async initiateDonation(campaignId: string, donorId: string | null, dto: InitiateDonationDto) {
    const campaign = await this.getCampaignById(campaignId);
    if (!campaign.isActive) throw new BadRequestException('Campaign is no longer active');

    const reference = this.paystackService.generateReference();

    // Create donation record
    const donation = this.donationRepo.create({
      campaignId,
      donorId,
      amount: dto.amount,
      currency: campaign.currency,
      isAnonymous: dto.isAnonymous || false,
      message: dto.message,
      status: 'pending',
      paymentReference: reference,
    });
    await this.donationRepo.save(donation);

    // Initialize Paystack payment
    const paymentResult = await this.paystackService.initializePayment({
      email: dto.email,
      amount: dto.amount * 100, // Convert to kobo/pesewas
      currency: campaign.currency,
      reference,
      metadata: { campaignId, donorId, donationId: donation.id },
    });

    return {
      donation,
      paymentUrl: paymentResult.data?.authorization_url,
      reference,
    };
  }

  async verifyDonation(reference: string) {
    const donation = await this.donationRepo.findOne({ where: { paymentReference: reference } });
    if (!donation) throw new NotFoundException('Donation not found');

    const verification = await this.paystackService.verifyPayment(reference);

    if (verification.data?.status === 'success') {
      donation.status = 'success';
      donation.paystackReference = verification.data.reference;
      await this.donationRepo.save(donation);

      // Update campaign raised amount and donor count
      await this.campaignRepo
        .createQueryBuilder()
        .update(CampaignEntity)
        .set({
          raisedAmount: () => `raised_amount + ${donation.amount}`,
          donorCount: () => `donor_count + 1`,
        })
        .where('id = :id', { id: donation.campaignId })
        .execute();

      return { status: 'success', donation };
    }

    donation.status = 'failed';
    await this.donationRepo.save(donation);
    return { status: 'failed', donation };
  }

  async handleWebhook(event: string, data: any) {
    if (event === 'charge.success') {
      await this.verifyDonation(data.reference);
    }
  }

  async getCampaignDonations(campaignId: string, page = 1, limit = 20) {
    return this.donationRepo.find({
      where: { campaignId, status: 'success' },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['donor'],
    });
  }
}
