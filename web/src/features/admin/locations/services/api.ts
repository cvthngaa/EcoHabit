import { apiClient } from '../../../../shared/services/api-client';
import type { AdminLocationDetailResponse, AdminLocationsResponse } from './types';

export const getAdminCollectionPoints = async (): Promise<AdminLocationsResponse> => {
  const { data } = await apiClient.get('/admin/collection-points');
  return data;
};

export const getAdminCollectionPointDetail = async (
  id: string,
): Promise<AdminLocationDetailResponse> => {
  const { data } = await apiClient.get(`/admin/collection-points/${id}`);
  return data;
};
