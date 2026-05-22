import { apiClient } from '../../../../shared/services/api-client';
import type {
  Reward,
  RewardStats,
  Redemption,
  PaginatedResponse,
  ListRewardsQuery,
  ListRedemptionsQuery,
  UpdateRewardStatusDto,
  UpdateRedemptionStatusDto,
} from './types';

// Rewards
export const getAdminRewards = async (params: ListRewardsQuery): Promise<PaginatedResponse<Reward>> => {
  const { data } = await apiClient.get('/admin/rewards', { params });
  return data;
};

export const getAdminRewardStats = async (): Promise<RewardStats> => {
  const { data } = await apiClient.get('/admin/rewards/stats');
  return data;
};

export const getAdminRewardDetail = async (id: string): Promise<Reward> => {
  const { data } = await apiClient.get(`/admin/rewards/${id}`);
  return data;
};

export const updateAdminRewardStatus = async (id: string, dto: UpdateRewardStatusDto) => {
  const { data } = await apiClient.patch(`/admin/rewards/${id}/status`, dto);
  return data;
};

// Redemptions
export const getAdminRedemptions = async (params: ListRedemptionsQuery): Promise<PaginatedResponse<Redemption>> => {
  const { data } = await apiClient.get('/admin/redemptions', { params });
  return data;
};

export const updateAdminRedemptionStatus = async (id: string, dto: UpdateRedemptionStatusDto) => {
  const { data } = await apiClient.patch(`/admin/redemptions/${id}/status`, dto);
  return data;
};
