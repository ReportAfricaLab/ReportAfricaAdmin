import { Controller, Post, Get, Param, Body, Query, UseGuards, Request, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DonationsService } from './donations.service';
import { PaystackService } from './paystack.service';
import { CreateCampaignDto, InitiateDonationDto } from './dto/donations.dto';

@Controller('donations')
export class DonationsController {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly paystackService: PaystackService,
  ) {}

  // === CAMPAIGNS ===

  @UseGuards(AuthGuard('jwt'))
  @Post('campaigns')
  createCampaign(@Request() req: any, @Body() dto: CreateCampaignDto) {
    return this.donationsService.createCampaign(req.user.id, req.user.country, dto);
  }

  @Get('campaigns/feed')
  getCampaignFeed(@Query('country') country: string, @Query('page') page?: string) {
    return this.donationsService.getCampaignFeed(country, Number(page) || 1);
  }

  @Get('campaigns/emergency')
  getEmergencyCampaigns(@Query('country') country: string) {
    return this.donationsService.getEmergencyCampaigns(country);
  }

  @Get('campaigns/category/:category')
  getCampaignsByCategory(
    @Param('category') category: string,
    @Query('country') country: string,
    @Query('page') page?: string,
  ) {
    return this.donationsService.getCampaignsByCategory(country, category, Number(page) || 1);
  }

  @Get('campaigns/:id')
  getCampaign(@Param('id') id: string) {
    return this.donationsService.getCampaignById(id);
  }

  @Get('campaigns/:id/donations')
  getCampaignDonations(@Param('id') id: string, @Query('page') page?: string) {
    return this.donationsService.getCampaignDonations(id, Number(page) || 1);
  }

  // === DONATIONS ===

  @UseGuards(AuthGuard('jwt'))
  @Post('campaigns/:id/donate')
  initiateDonation(@Param('id') id: string, @Request() req: any, @Body() dto: InitiateDonationDto) {
    return this.donationsService.initiateDonation(id, req.user.id, dto);
  }

  @Get('verify/:reference')
  verifyDonation(@Param('reference') reference: string) {
    return this.donationsService.verifyDonation(reference);
  }

  // === PAYSTACK WEBHOOK ===

  @Post('webhook/paystack')
  async handleWebhook(@Body() body: any, @Headers('x-paystack-signature') signature: string) {
    const isValid = this.paystackService.validateWebhook(JSON.stringify(body), signature);
    if (!isValid) return { status: 'invalid signature' };

    await this.donationsService.handleWebhook(body.event, body.data);
    return { status: 'ok' };
  }
}
