import { useQuery } from '@tanstack/react-query';
import { getAdminCollectionPointDetail, getAdminCollectionPoints } from './api';

export const locationKeys = {
  all: ['admin-collection-points'] as const,
  lists: () => [...locationKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...locationKeys.lists(), { filters }] as const,
  details: () => [...locationKeys.all, 'detail'] as const,
  detail: (id: string) => [...locationKeys.details(), id] as const,
};

export const useAdminCollectionPoints = () => {
  return useQuery({
    queryKey: locationKeys.list({}),
    queryFn: () => getAdminCollectionPoints(),
  });
};

export const useAdminCollectionPointDetail = (id: string | null) => {
  return useQuery({
    queryKey: id ? locationKeys.detail(id) : locationKeys.details(),
    queryFn: () => getAdminCollectionPointDetail(id!),
    enabled: !!id,
  });
};
