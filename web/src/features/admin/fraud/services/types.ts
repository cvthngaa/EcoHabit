// Types khớp với FraudFlag entity và fraud service của backend

export type FraudSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type FraudStatus = 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'REJECTED';
export type FraudSourceType =
  | 'AI_CLASSIFICATION'
  | 'COLLECTION'
  | 'POINTS'
  | 'REWARD'
  | 'QUIZ';

export interface FraudFlagUser {
  id: string;
  fullName: string;
  email: string;
}

export interface FraudFlag {
  id: string;
  user?: FraudFlagUser | null;
  sourceType: FraudSourceType;
  sourceId?: string | null;
  flagCode: string;
  description: string;
  severity: FraudSeverity;
  status: FraudStatus;
  metadata?: Record<string, unknown> | null;
  reviewedBy?: { id: string; fullName: string } | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface PaginatedFraudFlags {
  data: FraudFlag[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Shape từ fraud.service.ts getStats() */
export interface FraudStats {
  total: number;
  open: number;
  reviewing: number;
  resolved: number;
  rejected: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  bySourceType: Record<string, number>;
  recentOpenCount: number;
}

export interface ListFraudFlagsParams {
  page?: number;
  limit?: number;
  status?: FraudStatus | '';
  severity?: FraudSeverity | '';
  sourceType?: FraudSourceType | '';
  flagCode?: string;
}

export interface UpdateFraudFlagStatusDto {
  status: FraudStatus;
  reviewNote?: string;
}
