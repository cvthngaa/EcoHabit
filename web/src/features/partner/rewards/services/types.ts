export type RewardStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
export type RedemptionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED' | 'CANCELED';

export interface RewardPickupOption {
  id: string;
  location?: {
    id: string;
    name: string;
    address?: string;
  };
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  pointsCost: number;
  stock: number;
  status: RewardStatus;
  partnerProfile?: any;
  pickupOptions?: RewardPickupOption[];
  redemptions?: Redemption[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RedemptionUser {
  id: string;
  displayName?: string;
  email?: string;
}

export interface Redemption {
  id: string;
  user?: RedemptionUser;
  reward?: Pick<Reward, 'id' | 'name' | 'pointsCost'>;
  pointsSpent: number;
  status: RedemptionStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRewardDto {
  name: string;
  description?: string;
  thumbnailUrl?: string;
  pointsCost: number;
  stock: number;
  status: RewardStatus;
  pickupLocationIds?: string[];
}

export type UpdateRewardDto = Partial<CreateRewardDto>;

export interface UpdateRedemptionStatusDto {
  status: RedemptionStatus;
}
