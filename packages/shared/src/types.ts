export enum Country {
  NIGERIA = 'NG',
  GHANA = 'GH',
  KENYA = 'KE',
  SOUTH_AFRICA = 'ZA',
  UGANDA = 'UG',
  RWANDA = 'RW',
}

export enum ReportCategory {
  TRAFFIC = 'traffic',
  POLICE_SECURITY = 'police_security',
  GOVERNMENT = 'government',
  CONSTRUCTION = 'construction',
  ELECTION = 'election',
  EMERGENCY = 'emergency',
  ENVIRONMENTAL = 'environmental',
  MARKET_CONSUMER = 'market_consumer',
  GENDER_VIOLENCE = 'gender_violence',
  HEALTH = 'health',
  CORRUPTION = 'corruption',
  UTILITIES = 'utilities',
  MISSING_PERSONS = 'missing_persons',
}

export enum ReportSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum VerificationLevel {
  UNVERIFIED = 'unverified',
  COMMUNITY_VERIFIED = 'community_verified',
  AI_VERIFIED = 'ai_verified',
  OFFICIALLY_VERIFIED = 'officially_verified',
  TRUSTED_REPORTER = 'trusted_reporter',
}

export enum UserRole {
  CITIZEN = 'citizen',
  TRUSTED_REPORTER = 'trusted_reporter',
  JOURNALIST = 'journalist',
  NGO = 'ngo',
  GOVERNMENT_AGENCY = 'government_agency',
  EMERGENCY_SERVICE = 'emergency_service',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export enum TrustLevel {
  NEW_REPORTER = 'new_reporter',
  COMMUNITY_REPORTER = 'community_reporter',
  TRUSTED_REPORTER = 'trusted_reporter',
  ELITE_REPORTER = 'elite_reporter',
  INVESTIGATIVE_REPORTER = 'investigative_reporter',
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country: Country;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  country: Country;
  role: UserRole;
  trustLevel: TrustLevel;
  trustScore: number;
  isVerified: boolean;
  createdAt: Date;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  severity: ReportSeverity;
  verificationLevel: VerificationLevel;
  location: GeoLocation;
  media: MediaItem[];
  authorId: string;
  country: Country;
  isAnonymous: boolean;
  isLive: boolean;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'voice_note' | 'livestream';
  url: string;
  thumbnailUrl?: string;
  duration?: number;
}

export interface DonationCampaign {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  currency: string;
  authorId: string;
  country: Country;
  verificationLevel: VerificationLevel;
  isActive: boolean;
  createdAt: Date;
}

export interface Comment {
  id: string;
  reportId: string;
  userId: string;
  text: string;
  parentId?: string;
  likes: number;
  createdAt: Date;
  replies?: Comment[];
}

export interface ReportUpdate {
  id: string;
  reportId: string;
  authorId: string;
  text: string;
  media: MediaItem[];
  type: 'update' | 'resolution' | 'escalation';
  createdAt: Date;
}

export interface Tip {
  id: string;
  reportId: string;
  reporterId: string;
  amount: number;
  currency: string;
  message?: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: Date;
}
