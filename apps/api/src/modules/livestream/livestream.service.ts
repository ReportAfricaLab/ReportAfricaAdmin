import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LivestreamEntity } from '../../database/entities';

// Note: AWS IVS SDK would be @aws-sdk/client-ivs but it requires Node 20+
// For now we use the mock in dev and will add proper SDK when IVS is enabled

@Injectable()
export class LivestreamService {
  private readonly logger = new Logger(LivestreamService.name);
  private readonly region: string;
  private readonly hasCredentials: boolean;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(LivestreamEntity)
    private readonly streamRepo: Repository<LivestreamEntity>,
  ) {
    this.region = this.config.get('AWS_REGION', 'eu-west-1');
    const accessKeyId = this.config.get('AWS_ACCESS_KEY_ID', '');
    this.hasCredentials = !!accessKeyId && accessKeyId !== 'your_access_key';
  }

  async createStream(userId: string, country: string, dto: { title: string; description?: string; category?: string; latitude?: number; longitude?: number; electionName?: string; electionState?: string; electionPollingUnit?: string }) {
    // Create IVS channel via AWS API
    const channelData = await this.createIVSChannel(dto.title);
    const isElection = !!dto.electionName;

    const stream = this.streamRepo.create({
      userId,
      country,
      title: dto.title,
      description: dto.description || '',
      category: isElection ? 'election' : (dto.category || 'general'),
      latitude: dto.latitude,
      longitude: dto.longitude,
      channelArn: channelData.channelArn,
      streamKeyValue: channelData.streamKeyValue,
      ingestEndpoint: channelData.ingestEndpoint,
      playbackUrl: channelData.playbackUrl,
      status: isElection ? 'live' : 'ready',
      startedAt: isElection ? new Date() : undefined,
      electionName: dto.electionName,
      electionState: dto.electionState,
      electionPollingUnit: dto.electionPollingUnit,
    });

    return this.streamRepo.save(stream);
  }

  async goLive(streamId: string, userId: string) {
    const stream = await this.streamRepo.findOne({ where: { id: streamId, userId } });
    if (!stream) throw new NotFoundException('Stream not found');

    stream.status = 'live';
    stream.startedAt = new Date();
    return this.streamRepo.save(stream);
  }

  async endStream(streamId: string, userId: string) {
    const stream = await this.streamRepo.findOne({ where: { id: streamId, userId } });
    if (!stream) throw new NotFoundException('Stream not found');

    stream.status = 'ended';
    stream.endedAt = new Date();
    return this.streamRepo.save(stream);
  }

  async getLiveStreams(country: string, page = 1, limit = 20) {
    return this.streamRepo.find({
      where: { country, status: 'live' },
      order: { startedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });
  }

  async getStreamById(id: string) {
    return this.streamRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async getRecordings(country: string, page = 1, limit = 20) {
    return this.streamRepo.find({
      where: { country, status: 'ended' },
      order: { endedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });
  }

  async getUserStreams(userId: string) {
    return this.streamRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async getElectionLiveStreams(country: string, electionName?: string) {
    const qb = this.streamRepo.createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'user')
      .where('s.country = :country', { country })
      .andWhere('s.category = :category', { category: 'election' })
      .andWhere('s.status = :status', { status: 'live' });

    if (electionName) qb.andWhere('s.electionName = :electionName', { electionName });

    return qb.orderBy('s.startedAt', 'DESC').getMany();
  }

  private async createIVSChannel(title: string): Promise<{ channelArn: string; streamKeyValue: string; ingestEndpoint: string; playbackUrl: string }> {
    // IVS is not available in eu-west-1 free tier — return mock data
    // When you enable IVS (us-east-1), add @aws-sdk/client-ivs and replace this
    const mockId = `ch_${Date.now()}`;
    this.logger.log(`IVS channel created (mock): ${mockId}`);
    return {
      channelArn: `arn:aws:ivs:${this.region}:000000000000:channel/${mockId}`,
      streamKeyValue: `sk_live_${mockId}`,
      ingestEndpoint: `rtmps://${mockId}.global-contribute.live-video.net:443/app/`,
      playbackUrl: `https://${mockId}.${this.region}.playback.live-video.net/api/video/v1/${mockId}.m3u8`,
    };
  }
}
