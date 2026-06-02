import { apiClient } from '../../../../shared/services/api-client';
import type { AdminLocationsResponse } from './types';

export const getAdminCollectionPoints = async (): Promise<AdminLocationsResponse> => {
  const { data } = await apiClient.get('/admin/collection-points');
  return data;
};
