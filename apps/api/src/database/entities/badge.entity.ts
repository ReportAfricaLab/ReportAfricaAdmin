import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('badges')
export class BadgeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'badge_type' })
  badgeType: string; // course_completed, perfect_quiz, all_courses_completed, investigative_certified

  @Column({ name: 'course_id', nullable: true })
  courseId: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  icon: string;

  @CreateDateColumn({ name: 'earned_at' })
  earnedAt: Date;
}
