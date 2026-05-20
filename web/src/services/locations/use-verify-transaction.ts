import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { CollectionTransaction } from './types';

export function useVerifyTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pointsAwarded }: { id: string; pointsAwarded: number }): Promise<CollectionTransaction> => {
      const res = await apiClient.patch<CollectionTransaction>(`/partner/collection-transactions/${id}/verify`, { pointsAwarded });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
