import { apiClient } from '../../../../shared/services/api-client';
import type { AdminAuditLog, ListAuditLogsQuery, PaginatedResponse } from './types';

export const getAdminAuditLogs = async (params: ListAuditLogsQuery): Promise<PaginatedResponse<AdminAuditLog>> => {
  const { data } = await apiClient.get('/admin/audit', { params });
  return data;
};

export const getAdminAuditLogDetail = async (id: string): Promise<AdminAuditLog> => {
  const { data } = await apiClient.get(`/admin/audit/${id}`);
  return data;
};
