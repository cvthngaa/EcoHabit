import { apiClient } from '../../../../shared/services/api-client';
import type { Location } from '../../../../shared/domain/location';
import type { CreateCollectionPointDto, UpdateCollectionPointDto, QrResponse } from './types';

export const locationsApi = {
  getLocations: async (): Promise<Location[]> => {
    const res = await apiClient.get<Location[]>('/collection-points/my-locations');
    return res.data;
  },
  getLocation: async (id: string): Promise<Location> => {
    const res = await apiClient.get<Location>(`/collection-points/${id}`);
    return res.data;
  },
  createLocation: async (dto: CreateCollectionPointDto): Promise<Location> => {
    const res = await apiClient.post<Location>('/collection-points', dto);
    return res.data;
  },
  updateLocation: async (id: string, dto: UpdateCollectionPointDto): Promise<Location> => {
    const res = await apiClient.patch<Location>(`/collection-points/${id}`, dto);
    return res.data;
  },
  getQr: async (locationId: string): Promise<QrResponse> => {
    const res = await apiClient.get<QrResponse>(`/partner/locations/${locationId}/qr`);
    return res.data;
  },
  generateQr: async (locationId: string): Promise<QrResponse> => {
    const res = await apiClient.post<QrResponse>(`/partner/locations/${locationId}/qr/regenerate`);
    return res.data;
  },
};
