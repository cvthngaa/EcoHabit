import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listFraudFlags,
  getFraudStats,
  updateFraudFlagStatus,
} from './api';
import type { ListFraudFlagsParams, UpdateFraudFlagStatusDto } from './types';

export const FRAUD_FLAGS_KEY = 'admin-fraud-flags';
export const FRAUD_STATS_KEY = 'admin-fraud-stats';

export const useFraudFlags = (params: ListFraudFlagsParams = {}) =>
  useQuery({
    queryKey: [FRAUD_FLAGS_KEY, params],
    queryFn: () => listFraudFlags(params),
  });

export const useFraudStats = () =>
  useQuery({
    queryKey: [FRAUD_STATS_KEY],
    queryFn: getFraudStats,
  });

export const useUpdateFraudFlagStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateFraudFlagStatusDto }) =>
      updateFraudFlagStatus(id, dto),
    onSuccess: (_, { dto }) => {
      const label =
        dto.status === 'RESOLVED'
          ? 'Đã giải quyết'
          : dto.status === 'REVIEWING'
          ? 'Đang rà soát'
          : dto.status === 'REJECTED'
          ? 'Đã từ chối'
          : 'Đã cập nhật';
      toast.success(label);
      queryClient.invalidateQueries({ queryKey: [FRAUD_FLAGS_KEY] });
      queryClient.invalidateQueries({ queryKey: [FRAUD_STATS_KEY] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Cập nhật trạng thái thất bại');
    },
  });
};
