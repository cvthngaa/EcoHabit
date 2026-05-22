export type UserRole = 'USER' | 'PARTNER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'BANNED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  pointsBalance: number;
  lockedReason?: string | null;
  lockedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  partnerUsers: number;
  adminUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ListUsersQuery {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  sortBy?: 'createdAt' | 'fullName' | 'email' | 'pointsBalance' | 'status';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface UpdateUserStatusDto {
  status: UserStatus;
  reason?: string;
}

export interface AdjustPointsDto {
  amount: number;
  reason: string;
}

export type PointTransactionType = 'EARN' | 'SPEND' | 'ADJUST';
export type PointSourceType = 'TRASH_CLASSIFICATION' | 'DROPOFF_TRANSACTION' | 'REDEMPTION' | 'ADMIN' | 'QUIZ';

export interface PointTransaction {
  id: string;
  type: PointTransactionType;
  points: number;
  balanceAfter: number;
  sourceType?: PointSourceType | null;
  sourceId?: string | null;
  reasonCode?: string | null;
  note?: string | null;
  createdAt: string;
}

export type DropoffStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CANCELED';

export interface DropoffTransaction {
  id: string;
  quantityValue?: number | null;
  quantityUnit?: string | null;
  distanceKm?: number | null;
  pointsAwarded?: number | null;
  rejectionReason?: string | null;
  status?: DropoffStatus | null;
  createdAt: string;
  location?: { id: string; name: string; address: string } | null;
  acceptedWasteType?: { wasteType: string } | null;
}

export interface Redemption {
  id: string;
  pointsSpent?: number | null;
  status?: string | null;
  createdAt: string;
  reward?: { id: string; name: string } | null;
}

export interface TrashClassification {
  id: string;
  predictedLabel: string;
  predictedWasteType?: string | null;
  confidence?: number | null;
  suggestedBin?: string | null;
  status: string;
  createdAt: string;
}

export interface UserActivity {
  userId: string;
  pointTransactions: PointTransaction[];
  redemptions: Redemption[];
  dropoffs: DropoffTransaction[];
  trashClassifications: TrashClassification[];
}
