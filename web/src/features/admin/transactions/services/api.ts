import { apiClient } from '../../../../shared/services/api-client';
import type { AdminCollectionTransaction } from './types';

/** GET /admin/collection-transactions — trả về mảng tối đa 100 bản ghi mới nhất */
export const getAdminCollectionTransactions = async (): Promise<AdminCollectionTransaction[]> => {
  const { data } = await apiClient.get<AdminCollectionTransaction[]>('/admin/collection-transactions');
  return data;
};
