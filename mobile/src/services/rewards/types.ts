export type Reward = {
 id: string | number;
 name?: string;
 description?: string;
 thumbnailUrl?: string;
 pointsCost?: number;
 stock?: number;
 redeemCount?: number;
 [key: string]: unknown;
};

export type RewardsResponse = Reward[];

export type TopRewardsParams = {
 limit?: number;
};

export type RedeemRewardPayload = {
 rewardId: string | number;
};

export type RedeemRewardResponse = {
 message?: string;
 [key: string]: unknown;
};

export type RedemptionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED' | 'CANCELED';

export type UserRedemption = {
 id: string;
 pointsSpent?: number | null;
 status?: RedemptionStatus | null;
 createdAt?: string;
 updatedAt?: string;
 reward?: Reward | null;
 [key: string]: unknown;
};

export type UserRedemptionsResponse = UserRedemption[];
