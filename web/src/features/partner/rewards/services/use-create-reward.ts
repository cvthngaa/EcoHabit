import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/services/api-client';
import type { Reward, CreateRewardDto } from './types';
import { REWARDS_QUERY_KEY } from './use-get-rewards';

export function useCreateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateRewardDto): Promise<Reward> => {
      const res = await apiClient.post<Reward>('/partner/rewards', dto);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REWARDS_QUERY_KEY });
    },
  });
}
