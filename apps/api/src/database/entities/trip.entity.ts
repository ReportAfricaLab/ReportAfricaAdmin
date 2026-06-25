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

@Entity('trips')
export class TripEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'shared_with_user_id' })
  @Index()
  sharedWithUserId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'shared_with_user_id' })
  sharedWithUser: UserEntity;

  @Column({ type: 'decimal', precision: 10, scale: 7, name: 'start_lat' })
  startLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, name: 'start_lng' })
  startLng: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, name: 'current_lat' })
  currentLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, name: 'current_lng' })
  currentLng: number;

  @Column({ nullable: true })
  destination: string;

  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'ended_at', nullable: true })
  endedAt: Date;
}
