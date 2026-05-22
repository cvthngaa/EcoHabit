import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api-client';
import type { DashboardStatsResponse } from './types';

export const useGetDashboardStats = (filter: 'today' | 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: ['dashboard-stats', filter],
    queryFn: async (): Promise<DashboardStatsResponse> => {
      const { data } = await apiClient.get('/admin/dashboard/stats', {
        params: { filter }
      });
      return data;
    },
  });
};
