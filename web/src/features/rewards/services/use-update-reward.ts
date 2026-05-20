import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api-client';
import type { Reward, UpdateRewardDto } from './types';
import { REWARDS_QUERY_KEY } from './use-get-rewards';

export function useUpdateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRewardDto }): Promise<Reward> => {
      const res = await apiClient.put<Reward>(`/partner/rewards/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REWARDS_QUERY_KEY });
    },
  });
}
