import { useQuery } from '@tanstack/react-query';
import api from '../api-client';
import { RewardsResponse, TopRewardsParams } from './types';

export const topRewardsQueryKey = ({ limit = 5 }: TopRewardsParams = {}) =>
  ['rewards', 'top', { limit }] as const;

type UseGetTopRewardsOptions = TopRewardsParams & {
  enabled?: boolean;
};

export function useGetTopRewards({
  enabled = true,
  limit = 5,
}: UseGetTopRewardsOptions = {}) {
  return useQuery({
    queryKey: topRewardsQueryKey({ limit }),
    queryFn: async (): Promise<RewardsResponse> => {
      const response = await api.get<RewardsResponse>('/rewards/top', {
        params: { limit },
      });

      return response.data;
    },
    enabled,
  });
}
