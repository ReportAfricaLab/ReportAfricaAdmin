import { Injectable, NotFoundException, Inject, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserEntity, ReportEntity, CampaignEntity, MediaLicenseEntity, EarningsEntity } from '../../database/entities';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(ReportEntity) private readonly reportRepo: Repository<ReportEntity>,
    @InjectRepository(CampaignEntity) private readonly campaignRepo: Repository<CampaignEntity>,
    @InjectRepository(MediaLicenseEntity) private readonly licenseRepo: Repository<MediaLicenseEntity>,
    @InjectRepository(EarningsEntity) private readonly earningsRepo: Repository<EarningsEntity>,
    @Optional() @Inject(CACHE_MANAGER) private readonly cache?: Cache,
    @Optional() private readonly notifications?: NotificationsService,
  ) {}

  // === USERS ===
  async getUsers(page = 1, limit = 20, search?: string, role?: string, country?: string) {
    const where: any = {};
    if (search) where.username = Like(`%${search}%`);
    if (role) where.role = role;
    if (country) where.country = country;

    const [users, total] = await this.userRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateUser(id: string, data: { role?: string; isVerified?: boolean; trustLevel?: string }) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, data);
    return this.userRepo.save(user);
  }

  async banUser(id: string) {
    return this.updateUser(id, { role: 'banned' as any });
  }

  // === REPORTS ===
  async getReports(page = 1, limit = 20, country?: string, category?: string, flagged?: boolean) {
    const query = this.reportRepo.createQueryBuilder('report')
      .leftJoinAndSelect('report.author', 'author')
      .orderBy('report.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (country) query.andWhere('report.country = :country', { country });
    if (category) query.andWhere('report.category = :category', { category });
    if (flagged) query.andWhere('report.verificationLevel = :level', { level: 'unverified' });

    const [reports, total] = await query.getManyAndCount();
    return { reports, total, page, totalPages: Math.ceil(total / limit) };
  }

  async deleteReport(id: string) {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    await this.reportRepo.remove(report);
    return { deleted: true };
  }

  async updateReportVerification(id: string, level: string) {
    await this.reportRepo.update(id, { verificationLevel: level });
    return this.reportRepo.findOne({ where: { id } });
  }

  // === CAMPAIGNS ===
  async getCampaigns(page = 1, limit = 20, status?: string) {
    const where: any = {};
    if (status) where.verificationLevel = status;

    const [campaigns, total] = await this.campaignRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author'],
    });
    return { campaigns, total, page, totalPages: Math.ceil(total / limit) };
  }

  async approveCampaign(id: string) {
    await this.campaignRepo.update(id, { verificationLevel: 'ngo_verified', isActive: true });
    return this.campaignRepo.findOne({ where: { id } });
  }

  async rejectCampaign(id: string) {
    await this.campaignRepo.update(id, { verificationLevel: 'rejected', isActive: false });
    return this.campaignRepo.findOne({ where: { id } });
  }

  // === REVENUE ===
  async getRevenue() {
    const totalLicenseRevenue = await this.earningsRepo
      .createQueryBuilder('e')
      .select('e.currency', 'currency')
      .addSelect('SUM(e.amount)', 'reporterTotal')
      .where('e.source = :source', { source: 'media_license' })
      .groupBy('e.currency')
      .getRawMany();

    const totalLicenses = await this.licenseRepo.count({ where: { status: 'approved' } });
    const pendingLicenses = await this.licenseRepo.count({ where: { status: 'pending' } });

    return {
      platformRevenue: totalLicenseRevenue.map((r) => ({
        currency: r.currency,
        platformEarned: Number(r.reporterTotal), // platform gets same as reporter (50/50)
        reportersPaid: Number(r.reporterTotal),
      })),
      totalLicenses,
      pendingLicenses,
    };
  }

  // === MODERATION QUEUE ===
  async getModerationQueue(page = 1, limit = 20) {
    const [reports, total] = await this.reportRepo.findAndCount({
      where: { verificationLevel: 'unverified' },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author'],
    });
    return { reports, total, page, totalPages: Math.ceil(total / limit) };
  }

  // === OVERVIEW ===
  async getOverview() {
    const [totalUsers, totalReports, totalCampaigns, pendingCampaigns] = await Promise.all([
      this.userRepo.count(),
      this.reportRepo.count(),
      this.campaignRepo.count(),
      this.campaignRepo.count({ where: { verificationLevel: 'pending_review' } }),
    ]);

    const usersByCountry = await this.userRepo
      .createQueryBuilder('u')
      .select('u.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.country')
      .getRawMany();

    return { totalUsers, totalReports, totalCampaigns, pendingCampaigns, usersByCountry };
  }

  // === CIRCUIT BREAKER ===
  async toggleEventMode(active: boolean) {
    if (!this.cache) return { eventMode: false };
    if (active) {
      await this.cache.set('event_mode', 'active', 86400000); // 24h TTL
    } else {
      await this.cache.del('event_mode');
    }
    return { eventMode: active };
  }

  async getEventMode() {
    if (!this.cache) return { eventMode: false };
    const mode = await this.cache.get<string>('event_mode');
    return { eventMode: !!mode };
  }

  async sendSecurityAlert(country: string, message?: string) {
    if (!this.notifications) return { sent: false };
    await this.notifications.sendToCountry(country, {
      title: '🚨 Security Alert',
      body: message || 'For your safety, clear your local app data immediately. Go to Profile → Clear My Data.',
      data: { type: 'security_alert', action: 'clear_data' },
    });
    return { sent: true, country };
  }
}
