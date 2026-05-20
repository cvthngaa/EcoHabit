import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api-client';
import type { Location } from './types';

export function useGetLocation(id: string) {
  return useQuery({
    queryKey: ['location', id],
    queryFn: async (): Promise<Location> => {
      const res = await apiClient.get<Location>(`/collection-points/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}
