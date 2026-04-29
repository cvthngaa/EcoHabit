import { useQuery } from '@tanstack/react-query';
import api from '../api-client';
import { DailyTipResponse } from './types';

export const dailyTipQueryKey = ['tips', 'daily'] as const;

type UseGetDailyTipOptions = {
  enabled?: boolean;
};

export function useGetDailyTip({ enabled = true }: UseGetDailyTipOptions = {}) {
  return useQuery({
    queryKey: dailyTipQueryKey,
    queryFn: async (): Promise<DailyTipResponse> => {
      const response = await api.get<DailyTipResponse>('/gemini/daily-tip');

      return response.data;
    },
    enabled,
  });
}
