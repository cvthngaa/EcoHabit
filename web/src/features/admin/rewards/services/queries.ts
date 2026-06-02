import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminRewards,
  getAdminRewardStats,
  getAdminRewardDetail,
  updateAdminRewardStatus,
  getAdminRedemptions,
  updateAdminRedemptionStatus,
} from './api';
import type {
  ListRedemptionsQuery,
  ListRewardsQuery,
  UpdateRedemptionStatusDto,
  UpdateRewardStatusDto,
} from './types';

// Rewards
export const useAdminRewards = (params: ListRewardsQuery) => {
  return useQuery({
    queryKey: ['admin-rewards', params],
    queryFn: () => getAdminRewards(params),
  });
};

export const useAdminRewardStats = () => {
  return useQuery({
    queryKey: ['admin-reward-stats'],
    queryFn: getAdminRewardStats,
  });
};

export const useAdminRewardDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['admin-reward-detail', id],
    queryFn: () => getAdminRewardDetail(id!),
    enabled: !!id,
  });
};

export const useUpdateRewardStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRewardStatusDto }) =>
      updateAdminRewardStatus(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reward-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reward-detail', id] });
    },
  });
};

// Redemptions
export const useAdminRedemptions = (params: ListRedemptionsQuery) => {
  return useQuery({
    queryKey: ['admin-redemptions', params],
    queryFn: () => getAdminRedemptions(params),
    enabled: params.rewardId ? !!params.rewardId : true,
  });
};

export const useUpdateRedemptionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRedemptionStatusDto }) =>
      updateAdminRedemptionStatus(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reward-stats'] });
    },
  });
};
