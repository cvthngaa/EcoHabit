import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/services/api-client';
import type { Redemption, UpdateRedemptionStatusDto } from './types';
import { REDEMPTIONS_QUERY_KEY } from './use-get-redemptions';

export function useUpdateRedemptionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRedemptionStatusDto }): Promise<Redemption> => {
      const res = await apiClient.patch<Redemption>(`/partner/rewards/redemptions/${id}/status`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REDEMPTIONS_QUERY_KEY });
    },
  });
}
