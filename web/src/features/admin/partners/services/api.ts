import { apiClient } from '../../../../shared/services/api-client';
import type {
  Partner,
  PartnerStats,
  PaginatedResponse,
  ListPartnersQuery,
  UpdateApprovalDto,
  UpdateRolesDto,
  UpdatePartnerUserStatusDto,
} from './types';

export const getAdminPartners = async (params: ListPartnersQuery): Promise<PaginatedResponse<Partner>> => {
  const { data } = await apiClient.get('/admin/partners', { params });
  return data;
};

export const getAdminPartnerStats = async (): Promise<PartnerStats> => {
  const { data } = await apiClient.get('/admin/partners/stats');
  return data;
};

export const getAdminPartnerDetail = async (id: string): Promise<Partner> => {
  const { data } = await apiClient.get(`/admin/partners/${id}`);
  return data;
};

export const updatePartnerApproval = async (id: string, dto: UpdateApprovalDto) => {
  const { data } = await apiClient.patch(`/admin/partners/${id}/approval`, dto);
  return data;
};

export const updatePartnerRoles = async (id: string, dto: UpdateRolesDto) => {
  const { data } = await apiClient.patch(`/admin/partners/${id}/roles`, dto);
  return data;
};

export const updatePartnerUserStatus = async (id: string, dto: UpdatePartnerUserStatusDto) => {
  const { data } = await apiClient.patch(`/admin/partners/${id}/status`, dto);
  return data;
};
