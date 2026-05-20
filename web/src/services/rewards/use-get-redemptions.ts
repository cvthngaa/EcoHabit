import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { Redemption } from './types';

export const REDEMPTIONS_QUERY_KEY = ['redemptions'] as const;

export function useGetRedemptions() {
  return useQuery({
    queryKey: REDEMPTIONS_QUERY_KEY,
    queryFn: async (): Promise<Redemption[]> => {
      const res = await apiClient.get<Redemption[]>('/partner/rewards/redemptions');
      return res.data;
    },
  });
}
