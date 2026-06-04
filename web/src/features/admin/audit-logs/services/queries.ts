import { useQuery } from '@tanstack/react-query';
import { getAdminAuditLogs, getAdminAuditLogDetail } from './api';
import type { ListAuditLogsQuery } from './types';

export const useAdminAuditLogs = (query: ListAuditLogsQuery) => {
  return useQuery({
    queryKey: ['admin-audit-logs', query],
    queryFn: () => getAdminAuditLogs(query),
  });
};

export const useAdminAuditLogDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['admin-audit-log', id],
    queryFn: () => getAdminAuditLogDetail(id!),
    enabled: !!id,
  });
};
