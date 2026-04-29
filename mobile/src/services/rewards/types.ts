export type Reward = {
  id: string | number;
  name?: string;
  description?: string;
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
