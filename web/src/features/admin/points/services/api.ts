import { apiClient } from '../../../../shared/services/api-client';
import type {
  PointRule,
  PaginatedPointTransactions,
  ListPointTransactionsParams,
  CreatePointRuleDto,
  UpdatePointRuleDto,
} from './types';

/** GET /admin/points/rules */
export const getPointRules = async (): Promise<PointRule[]> => {
  const { data } = await apiClient.get<PointRule[]>('/admin/points/rules');
  return data;
};

/** GET /admin/points/transactions */
export const getPointTransactions = async (
  params: ListPointTransactionsParams,
): Promise<PaginatedPointTransactions> => {
  const { data } = await apiClient.get<PaginatedPointTransactions>('/admin/points/transactions', { params });
  return data;
};

/** POST /admin/points/rules */
export const createPointRule = async (dto: CreatePointRuleDto): Promise<PointRule> => {
  const { data } = await apiClient.post<PointRule>('/admin/points/rules', dto);
  return data;
};

/** PATCH /admin/points/rules/:id */
export const updatePointRule = async (id: string, dto: UpdatePointRuleDto): Promise<PointRule> => {
  const { data } = await apiClient.patch<PointRule>(`/admin/points/rules/${id}`, dto);
  return data;
};
