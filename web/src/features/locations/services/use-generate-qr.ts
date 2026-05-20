import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api-client';
import type { QrResponse } from './types';

export function useGenerateQr() {
  return useMutation({
    mutationFn: async (locationId: string): Promise<QrResponse> => {
      const res = await apiClient.post<QrResponse>(`/partner/locations/${locationId}/qr`);
      return res.data;
    },
  });
}
