import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/services/api-client';
import type { QrResponse } from './types';

export function useGetQr(locationId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['location-qr', locationId],
    queryFn: async (): Promise<QrResponse> => {
      const res = await apiClient.get<QrResponse>(`/partner/locations/${locationId}/qr`);
      return res.data;
    },
    enabled,
  });
}
