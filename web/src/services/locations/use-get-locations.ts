import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { Location } from './types';

export function useGetLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async (): Promise<Location[]> => {
      const res = await apiClient.get<Location[]>('/collection-points');
      return res.data;
    },
  });
}
