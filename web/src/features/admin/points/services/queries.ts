import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getPointRules,
  getPointTransactions,
  createPointRule,
  updatePointRule,
} from './api';
import type { CreatePointRuleDto, UpdatePointRuleDto, ListPointTransactionsParams } from './types';

export const POINT_RULES_KEY = 'admin-point-rules';
export const POINT_TRANSACTIONS_KEY = 'admin-point-transactions';

export const usePointRules = () =>
  useQuery({
    queryKey: [POINT_RULES_KEY],
    queryFn: getPointRules,
  });

export const usePointTransactions = (params: ListPointTransactionsParams = {}) =>
  useQuery({
    queryKey: [POINT_TRANSACTIONS_KEY, params],
    queryFn: () => getPointTransactions(params),
  });

export const useCreatePointRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePointRuleDto) => createPointRule(dto),
    onSuccess: () => {
      toast.success('Đã tạo quy tắc điểm thành công!');
      queryClient.invalidateQueries({ queryKey: [POINT_RULES_KEY] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Tạo quy tắc thất bại');
    },
  });
};

export const useUpdatePointRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePointRuleDto }) => updatePointRule(id, dto),
    onSuccess: () => {
      toast.success('Đã cập nhật quy tắc điểm!');
      queryClient.invalidateQueries({ queryKey: [POINT_RULES_KEY] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Cập nhật thất bại');
    },
  });
};
