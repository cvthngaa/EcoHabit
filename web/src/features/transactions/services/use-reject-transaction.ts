import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api-client';
import type { CollectionTransaction, RejectTransactionDto } from './types';
import { TRANSACTIONS_QUERY_KEY } from './use-get-transactions';

export function useRejectTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      rejectionReason,
    }: { id: string } & RejectTransactionDto): Promise<CollectionTransaction> => {
      const res = await apiClient.patch<CollectionTransaction>(
        `/partner/collection-transactions/${id}/reject`,
        { rejectionReason },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
  });
}
