import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminUsers,
  getAdminUserStats,
  getAdminUserDetail,
  updateAdminUserStatus,
  adjustAdminUserPoints,
  getAdminUserPoints,
  getAdminUserDropoffs,
  getAdminUserRedemptions,
  getAdminUserAiClassifications,
} from './api';
import type { ListUsersQuery, UpdateUserStatusDto, AdjustPointsDto } from './types';

export const useAdminUsers = (params: ListUsersQuery) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => getAdminUsers(params),
  });
};

export const useAdminUserStats = () => {
  return useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: getAdminUserStats,
  });
};

export const useAdminUserDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['admin-user-detail', id],
    queryFn: () => getAdminUserDetail(id!),
    enabled: !!id,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserStatusDto }) =>
      updateAdminUserStatus(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', id] });
    },
  });
};

export const useAdjustUserPoints = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AdjustPointsDto }) =>
      adjustAdminUserPoints(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-points', id] });
    },
  });
};

export const useAdminUserPoints = (id: string | null, params: any) => {
  return useQuery({
    queryKey: ['admin-user-points', id, params],
    queryFn: () => getAdminUserPoints(id!, params),
    enabled: !!id,
  });
};

export const useAdminUserDropoffs = (id: string | null, params: any) => {
  return useQuery({
    queryKey: ['admin-user-dropoffs', id, params],
    queryFn: () => getAdminUserDropoffs(id!, params),
    enabled: !!id,
  });
};

export const useAdminUserRedemptions = (id: string | null, params: any) => {
  return useQuery({
    queryKey: ['admin-user-redemptions', id, params],
    queryFn: () => getAdminUserRedemptions(id!, params),
    enabled: !!id,
  });
};

export const useAdminUserAiClassifications = (id: string | null, params: any) => {
  return useQuery({
    queryKey: ['admin-user-ai-classifications', id, params],
    queryFn: () => getAdminUserAiClassifications(id!, params),
    enabled: !!id,
  });
};
