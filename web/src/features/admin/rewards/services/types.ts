export type RewardStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
export type RedemptionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED' | 'CANCELED';

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  status: RewardStatus;
  createdAt: string;
  partnerProfile?: {
    id: string;
    organizationName: string;
  } | null;
}

export interface RewardStats {
  totalRewards: number;
  activeRewards: number;
  inactiveRewards: number;
  outOfStockRewards: number;
  lowStockRewards: number;
  totalRedemptions: number;
  pendingRedemptions: number;
  completedRedemptions: number;
  cancelledRedemptions: number;
}

export interface Redemption {
  id: string;
  pointsSpent: number;
  status: RedemptionStatus;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  reward?: {
    id: string;
    name: string;
    partnerProfile?: {
      id: string;
      organizationName: string;
    } | null;
  } | null;
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

export interface ListRewardsQuery {
  search?: string;
  status?: RewardStatus;
  partnerId?: string;
  sortBy?: 'createdAt' | 'name' | 'pointsCost' | 'stock' | 'status';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface ListRedemptionsQuery {
  status?: RedemptionStatus;
  userId?: string;
  rewardId?: string;
  partnerId?: string;
  from?: string;
  to?: string;
  sortBy?: 'createdAt' | 'pointsSpent' | 'status';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface UpdateRewardStatusDto {
  status: RewardStatus;
}

export interface UpdateRedemptionStatusDto {
  status: RedemptionStatus;
}
