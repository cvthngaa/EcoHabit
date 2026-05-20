import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { Reward } from './types';

export const REWARDS_QUERY_KEY = ['rewards'] as const;

export function useGetRewards() {
  return useQuery({
    queryKey: REWARDS_QUERY_KEY,
    queryFn: async (): Promise<Reward[]> => {
      // Typically, partner might fetch their own rewards via /partner/rewards,
      // but according to the given API, we'll try /rewards.
      // If it requires partner context, we might need /partner/rewards.
      // We will use /partner/rewards for consistency with POST/PUT/DELETE.
      try {
        const res = await apiClient.get<Reward[]>('/partner/rewards');
        return res.data;
      } catch (err) {
        // Fallback to /rewards if /partner/rewards doesn't exist
        const res = await apiClient.get<Reward[]>('/rewards');
        return res.data;
      }
    },
  });
}
