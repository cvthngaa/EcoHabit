import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminPartners,
  getAdminPartnerStats,
  getAdminPartnerDetail,
  updatePartnerApproval,
  updatePartnerRoles,
  updatePartnerUserStatus,
} from './api';
import type { ListPartnersQuery, UpdateApprovalDto, UpdateRolesDto, UpdatePartnerUserStatusDto } from './types';

export const useAdminPartners = (params: ListPartnersQuery) => {
  return useQuery({
    queryKey: ['admin-partners', params],
    queryFn: () => getAdminPartners(params),
  });
};

export const useAdminPartnerStats = () => {
  return useQuery({
    queryKey: ['admin-partner-stats'],
    queryFn: getAdminPartnerStats,
  });
};

export const useAdminPartnerDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['admin-partner-detail', id],
    queryFn: () => getAdminPartnerDetail(id!),
    enabled: !!id,
  });
};

export const useUpdatePartnerApproval = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateApprovalDto }) =>
      updatePartnerApproval(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      queryClient.invalidateQueries({ queryKey: ['admin-partner-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-partner-detail', id] });
    },
  });
};

export const useUpdatePartnerRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRolesDto }) =>
      updatePartnerRoles(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      queryClient.invalidateQueries({ queryKey: ['admin-partner-detail', id] });
    },
  });
};

export const useUpdatePartnerUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePartnerUserStatusDto }) =>
      updatePartnerUserStatus(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      queryClient.invalidateQueries({ queryKey: ['admin-partner-detail', id] });
    },
  });
};
