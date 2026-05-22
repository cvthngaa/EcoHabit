import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api-client';
import type { Reward } from './types';

export const REWARDS_QUERY_KEY = ['rewards'] as const;

export function useGetRewards() {
  return useQuery({
    queryKey: REWARDS_QUERY_KEY,
    queryFn: async (): Promise<Reward[]> => {
      const res = await apiClient.get<Reward[]>('/partner/rewards');
      return res.data;
    },
  });
}
