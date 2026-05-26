import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CampaignEntity } from './campaign.entity';

@Entity('donations')
export class DonationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'campaign_id' })
  @Index()
  campaignId: string;

  @ManyToOne(() => CampaignEntity)
  @JoinColumn({ name: 'campaign_id' })
  campaign: CampaignEntity;

  @Column({ name: 'donor_id', nullable: true })
  @Index()
  donorId: string | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'donor_id' })
  donor: UserEntity | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ name: 'is_anonymous', default: false })
  isAnonymous: boolean;

  @Column({ nullable: true })
  message: string;

  @Column({ default: 'pending' })
  @Index()
  status: string; // pending, success, failed

  @Column({ name: 'payment_reference', nullable: true, unique: true })
  paymentReference: string;

  @Column({ name: 'paystack_reference', nullable: true })
  paystackReference: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
