import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { CollectionTransaction, VerifyTransactionDto } from './types';
import { TRANSACTIONS_QUERY_KEY } from './use-get-transactions';

export function useVerifyTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      pointsAwarded,
    }: { id: string } & VerifyTransactionDto): Promise<CollectionTransaction> => {
      const res = await apiClient.patch<CollectionTransaction>(
        `/partner/collection-transactions/${id}/verify`,
        { pointsAwarded },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
  });
}
