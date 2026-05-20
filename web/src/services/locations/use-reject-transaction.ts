import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { CollectionTransaction } from './types';

export function useRejectTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rejectionReason }: { id: string; rejectionReason: string }): Promise<CollectionTransaction> => {
      const res = await apiClient.patch<CollectionTransaction>(`/partner/collection-transactions/${id}/reject`, { rejectionReason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
