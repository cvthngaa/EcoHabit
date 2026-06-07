import { apiClient } from '../../../../shared/services/api-client';
import type { AdminDashboardStats } from './types';

export const getAdminDashboardStats = async (filter: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<AdminDashboardStats> => {
  const { data } = await apiClient.get<AdminDashboardStats>('/admin/dashboard/stats', {
    params: { filter },
  });
  return data;
};
