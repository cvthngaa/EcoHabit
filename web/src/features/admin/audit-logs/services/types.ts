export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  targetUserId?: string | null;
  action: string;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface ListAuditLogsQuery {
  page?: number;
  limit?: number;
  action?: string;
  actorEmail?: string;
  targetUserId?: string;
  from?: string;
  to?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
