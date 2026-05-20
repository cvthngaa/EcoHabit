import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api-client';
import { REWARDS_QUERY_KEY } from './use-get-rewards';

export function useDeleteReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/partner/rewards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REWARDS_QUERY_KEY });
    },
  });
}
