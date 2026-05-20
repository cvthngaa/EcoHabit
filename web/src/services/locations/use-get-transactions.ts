import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { CollectionTransaction } from './types';

export function useGetTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<CollectionTransaction[]> => {
      const res = await apiClient.get<CollectionTransaction[]>('/partner/collection-transactions');
      return res.data;
    },
  });
}
