import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/services/api-client';
import { TRANSACTIONS_QUERY_KEY } from './use-get-transactions';
import toast from 'react-hot-toast';

export interface ScanUserQrPayload {
  qrToken: string;
  locationId: string;
  pointsAwarded: number;
}

export function useScanUserQr() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ScanUserQrPayload) => {
      const res = await apiClient.post('/partner/collection-transactions/scan-user-qr', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Check-in và cộng điểm thành công!');
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi gọi API check-in.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}
