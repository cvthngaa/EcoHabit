import { apiClient } from '../../../../shared/services/api-client';
import type {
  PaginatedFraudFlags,
  FraudStats,
  FraudFlag,
  ListFraudFlagsParams,
  UpdateFraudFlagStatusDto,
} from './types';

/** GET /admin/fraud */
export const listFraudFlags = async (params: ListFraudFlagsParams): Promise<PaginatedFraudFlags> => {
  // Bỏ qua các param rỗng để không gửi lên server
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null),
  );
  const { data } = await apiClient.get<PaginatedFraudFlags>('/admin/fraud', { params: cleanParams });
  return data;
};

/** GET /admin/fraud/stats */
export const getFraudStats = async (): Promise<FraudStats> => {
  const { data } = await apiClient.get<FraudStats>('/admin/fraud/stats');
  return data;
};

/** GET /admin/fraud/:id */
export const getFraudFlagDetail = async (id: string): Promise<FraudFlag> => {
  const { data } = await apiClient.get<FraudFlag>(`/admin/fraud/${id}`);
  return data;
};

/** PATCH /admin/fraud/:id/status */
export const updateFraudFlagStatus = async (
  id: string,
  dto: UpdateFraudFlagStatusDto,
): Promise<FraudFlag> => {
  const { data } = await apiClient.patch<FraudFlag>(`/admin/fraud/${id}/status`, dto);
  return data;
};
