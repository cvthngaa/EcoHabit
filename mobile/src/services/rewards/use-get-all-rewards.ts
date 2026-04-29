import { useQuery } from '@tanstack/react-query';
import api from '../api-client';
import { RewardsResponse } from './types';

export const allRewardsQueryKey = ['rewards', 'all'] as const;

type UseGetAllRewardsOptions = {
  enabled?: boolean;
};

export function useGetAllRewards({ enabled = true }: UseGetAllRewardsOptions = {}) {
  return useQuery({
    queryKey: allRewardsQueryKey,
    queryFn: async (): Promise<RewardsResponse> => {
      const response = await api.get<RewardsResponse>('/rewards');

      return response.data;
    },
    enabled,
  });
}
