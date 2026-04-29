import { useQuery } from '@tanstack/react-query';
import api from '../api-client';
import { PointHistoryResponse } from './types';

export const pointHistoryQueryKey = ['points', 'history'] as const;

type UseGetPointHistoryOptions = {
  enabled?: boolean;
};

export function useGetPointHistory({ enabled = true }: UseGetPointHistoryOptions = {}) {
  return useQuery({
    queryKey: pointHistoryQueryKey,
    queryFn: async (): Promise<PointHistoryResponse> => {
      const response = await api.get<PointHistoryResponse>('/points/history');

      return response.data;
    },
    enabled,
  });
}
