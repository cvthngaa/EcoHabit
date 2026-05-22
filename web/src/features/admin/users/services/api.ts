import { apiClient } from '../../../../shared/services/api-client';
import type {
  User,
  UserStats,
  PaginatedResponse,
  ListUsersQuery,
  UpdateUserStatusDto,
  AdjustPointsDto,
  PointTransaction,
  DropoffTransaction,
  Redemption,
  TrashClassification,
} from './types';

export const getAdminUsers = async (params: ListUsersQuery): Promise<PaginatedResponse<User>> => {
  const { data } = await apiClient.get('/admin/users', { params });
  return data;
};

export const getAdminUserStats = async (): Promise<UserStats> => {
  const { data } = await apiClient.get('/admin/users/stats');
  return data;
};

export const getAdminUserDetail = async (id: string): Promise<User> => {
  const { data } = await apiClient.get(`/admin/users/${id}`);
  return data;
};

export const updateAdminUserStatus = async (id: string, dto: UpdateUserStatusDto) => {
  const { data } = await apiClient.patch(`/admin/users/${id}/status`, dto);
  return data;
};

export const adjustAdminUserPoints = async (id: string, dto: AdjustPointsDto) => {
  const { data } = await apiClient.post(`/admin/users/${id}/points/adjust`, dto);
  return data;
};

export const getAdminUserPoints = async (id: string, params: { page?: number; limit?: number; type?: string }) => {
  const { data } = await apiClient.get<PaginatedResponse<PointTransaction>>(`/admin/users/${id}/points`, { params });
  return data;
};

export const getAdminUserDropoffs = async (id: string, params: { page?: number; limit?: number; status?: string }) => {
  const { data } = await apiClient.get<PaginatedResponse<DropoffTransaction>>(`/admin/users/${id}/dropoffs`, { params });
  return data;
};

export const getAdminUserRedemptions = async (id: string, params: { page?: number; limit?: number }) => {
  const { data } = await apiClient.get<PaginatedResponse<Redemption>>(`/admin/users/${id}/redemptions`, { params });
  return data;
};

export const getAdminUserAiClassifications = async (id: string, params: { page?: number; limit?: number }) => {
  const { data } = await apiClient.get<PaginatedResponse<TrashClassification>>(`/admin/users/${id}/ai-classifications`, { params });
  return data;
};
