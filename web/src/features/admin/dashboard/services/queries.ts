import { useQuery } from '@tanstack/react-query';
import { getAdminDashboardStats } from './api';

export const ADMIN_DASHBOARD_STATS_KEY = 'admin-dashboard-stats';

export const useAdminDashboardStats = (filter: 'today' | 'week' | 'month' | 'year' = 'month') =>
  useQuery({
    queryKey: [ADMIN_DASHBOARD_STATS_KEY, filter],
    queryFn: () => getAdminDashboardStats(filter),
  });
