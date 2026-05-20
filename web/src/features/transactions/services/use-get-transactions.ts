import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api-client';
import type { CollectionTransaction } from './types';

export const TRANSACTIONS_QUERY_KEY = ['transactions'] as const;

export function useGetTransactions() {
  return useQuery({
    queryKey: TRANSACTIONS_QUERY_KEY,
    queryFn: async (): Promise<CollectionTransaction[]> => {
      const res = await apiClient.get<CollectionTransaction[]>(
        '/partner/collection-transactions',
      );
      return res.data;
    },
    // Refresh every 60 s so the partner sees near-real-time data
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}
