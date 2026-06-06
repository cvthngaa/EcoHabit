import { useQuery } from '@tanstack/react-query';
import { getAdminCollectionTransactions } from './api';

export const ADMIN_COLLECTION_TRANSACTIONS_KEY = 'admin-collection-transactions';

export const useAdminCollectionTransactions = () =>
  useQuery({
    queryKey: [ADMIN_COLLECTION_TRANSACTIONS_KEY],
    queryFn: getAdminCollectionTransactions,
  });
