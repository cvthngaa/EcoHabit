import { useQuery } from '@tanstack/react-query';
import { locationsApi } from './api';

export const locationsKeys = {
  all: ['locations'] as const,
  lists: () => [...locationsKeys.all, 'list'] as const,
  details: () => [...locationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...locationsKeys.details(), id] as const,
  qr: (id: string) => [...locationsKeys.detail(id), 'qr'] as const,
};

export function useGetLocations() {
  return useQuery({
    queryKey: locationsKeys.lists(),
    queryFn: locationsApi.getLocations,
  });
}

export function useGetLocation(id: string) {
  return useQuery({
    queryKey: locationsKeys.detail(id),
    queryFn: () => locationsApi.getLocation(id),
    enabled: !!id,
  });
}

export function useGetQr(locationId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: locationsKeys.qr(locationId),
    queryFn: () => locationsApi.getQr(locationId),
    enabled: !!locationId && enabled,
  });
}
