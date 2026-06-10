import { useQuery } from '@tanstack/react-query';
import api from '../api-client';
import { Badge } from './types';

export const myBadgesQueryKey = ['badges', 'me'] as const;

export function useGetMyBadges() {
  return useQuery({
    queryKey: myBadgesQueryKey,
    queryFn: async (): Promise<Badge[]> => {
      const response = await api.get<Badge[]>('/badges/me');
      return response.data;
    },
  });
}
