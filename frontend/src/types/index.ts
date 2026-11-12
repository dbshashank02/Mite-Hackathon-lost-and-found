export type UserRole = 'STUDENT' | 'FINDER' | 'SECURITY' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  handle: string;
  role: UserRole;
  department: string;
  verifiedBadge: boolean;
}

export type ItemType = 'LOST' | 'FOUND';

export type ItemCategory =
  | 'Electronics'
  | 'Wallets/Bags'
  | 'Keys'
  | 'Identification'
  | 'Apparel'
  | 'Books';

export type ItemStatus =
  | 'REPORTED'
  | 'LOGGED_IN_DEPOT'
  | 'MATCH_SUGGESTED'
  | 'CLAIM_PENDING'
  | 'VERIFICATION_APPROVED'
  | 'AWAITING_PICKUP'
  | 'RETURNED'
  | 'UNCLAIMED_ARCHIVE'
  | 'AUCTION_DONATED';

export interface ItemCoords {
  x: number;
  y: number;
  lat: number;
  lng: number;
}

export interface SensitiveData {
  serialNumber?: string;
  privateTraits?: string;
  walletContents?: string;
  finderPhone?: string;
}

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  category: ItemCategory;
  brand: string;
  color: string;
  imageUrl: string;
  buildingId: string;
  coords: ItemCoords;
  timestamp: string;
  status: ItemStatus;
  lockerId?: string;
  retentionDays: 30 | 60 | 90;
  expiresAt: string;
  sensitive: SensitiveData;
}

export interface MatchScoreBreakdown {
  visual: number; // 0-100 (35% weight)
  category: number; // 0-100 (30% weight)
  location: number; // 0-100 (20% weight)
  time: number; // 0-100 (15% weight)
}

export interface MatchResult {
  lostItemId: string;
  foundItemId: string;
  totalScore: number;
  breakdown: MatchScoreBreakdown;
  explanation: string[];
}

export type ClaimStatus = 'PENDING' | 'EVIDENCE_REQUESTED' | 'APPROVED' | 'DENIED';

export interface Claim {
  id: string;
  itemId: string;
  claimantId: string;
  secretAnswer: string;
  proofImageUrl?: string;
  status: ClaimStatus;
  fraudFlags: string[];
  qrToken?: string;
  otpCode?: string;
  otpExpiresAt?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  itemId: string;
  senderId: string;
  senderRole: UserRole;
  senderHandle: string;
  message: string;
  timestamp: string;
  scrubbedNotice?: boolean;
}

export interface HotspotZone {
  buildingId: string;
  name: string;
  count: number;
  intensity: number; // 0.0 - 1.0
  coords: { x: number; y: number };
}

export interface AnalyticsSummary {
  recoveryRate: number; // percentage
  medianReturnTimeHours: number;
  activeLockerCapacity: {
    used: number;
    total: number;
    percentage: number;
  };
  weeklyVolumeTrends: {
    day: string;
    lost: number;
    found: number;
    returned: number;
  }[];
  categoryBreakdown: {
    category: ItemCategory;
    count: number;
  }[];
}

export interface HandoverVerificationResult {
  success: boolean;
  message: string;
  item?: Item;
}
