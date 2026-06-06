// Types khớp với PointRule và PointTransaction entities

export type PointEventType =
  | 'CLASSIFICATION_CORRECT'
  | 'DROPOFF_CONFIRMED'
  | 'REDEMPTION'
  | 'MANUAL_ADJUST';

export type PointTransactionType = 'EARN' | 'SPEND';

export type PointSourceType =
  | 'TRASH_CLASSIFICATION'
  | 'DROPOFF_TRANSACTION'
  | 'REDEMPTION'
  | 'ADMIN'
  | 'QUIZ';

export interface PointRule {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  eventType: PointEventType;
  points: number;
  isActive: boolean;
  createdAt: string;
}

export interface PointTransactionUser {
  id: string;
  fullName: string;
  email: string;
}

export interface AdminPointTransaction {
  id: string;
  user: PointTransactionUser;
  type: PointTransactionType;
  points: number;
  balanceAfter: number;
  sourceType?: PointSourceType | null;
  sourceId?: string | null;
  reasonCode?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface PaginatedPointTransactions {
  data: AdminPointTransaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListPointTransactionsParams {
  page?: number;
  limit?: number;
  userId?: string;
  type?: PointTransactionType;
  sourceType?: PointSourceType;
}

export interface CreatePointRuleDto {
  code: string;
  name: string;
  description?: string;
  eventType: PointEventType;
  points: number;
  isActive?: boolean;
}

export interface UpdatePointRuleDto {
  name?: string;
  description?: string;
  points?: number;
  isActive?: boolean;
}
