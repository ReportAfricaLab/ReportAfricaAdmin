import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('overview')
  getOverview() {
    return this.service.getOverview();
  }

  // === USERS ===
  @Get('users')
  getUsers(
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('country') country?: string,
  ) {
    return this.service.getUsers(Number(page) || 1, 20, search, role, country);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: { role?: string; isVerified?: boolean; trustLevel?: string }) {
    return this.service.updateUser(id, body);
  }

  @Patch('users/:id/ban')
  banUser(@Param('id') id: string) {
    return this.service.banUser(id);
  }

  // === REPORTS ===
  @Get('reports')
  getReports(
    @Query('page') page?: string,
    @Query('country') country?: string,
    @Query('category') category?: string,
    @Query('flagged') flagged?: string,
  ) {
    return this.service.getReports(Number(page) || 1, 20, country, category, flagged === 'true');
  }

  @Delete('reports/:id')
  deleteReport(@Param('id') id: string) {
    return this.service.deleteReport(id);
  }

  @Patch('reports/:id/verify')
  verifyReport(@Param('id') id: string, @Body() body: { level: string }) {
    return this.service.updateReportVerification(id, body.level);
  }

  // === CAMPAIGNS ===
  @Get('campaigns')
  getCampaigns(@Query('page') page?: string, @Query('status') status?: string) {
    return this.service.getCampaigns(Number(page) || 1, 20, status);
  }

  @Patch('campaigns/:id/approve')
  approveCampaign(@Param('id') id: string) {
    return this.service.approveCampaign(id);
  }

  @Patch('campaigns/:id/reject')
  rejectCampaign(@Param('id') id: string) {
    return this.service.rejectCampaign(id);
  }

  // === MODERATION ===
  @Get('moderation-queue')
  getModerationQueue(@Query('page') page?: string) {
    return this.service.getModerationQueue(Number(page) || 1);
  }

  // === REVENUE ===
  @Get('revenue')
  getRevenue() {
    return this.service.getRevenue();
  }

  // === CIRCUIT BREAKER (Event Mode) ===
  @Patch('event-mode')
  toggleEventMode(@Body() body: { active: boolean }) {
    return this.service.toggleEventMode(body.active);
  }

  @Get('event-mode')
  getEventMode() {
    return this.service.getEventMode();
  }

  // === SECURITY ALERT (regional data wipe notification) ===
  @Post('security-alert')
  sendSecurityAlert(@Body() body: { country: string; message?: string }) {
    return this.service.sendSecurityAlert(body.country, body.message);
  }
}
