import { useQuery } from '@tanstack/react-query';
import api from '../api-client';
import { UserProfile } from './types';

export const profileQueryKey = ['auth', 'profile'] as const;

type UseGetProfileOptions = {
  enabled?: boolean;
};

export function useGetProfile({ enabled = true }: UseGetProfileOptions = {}) {
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: async (): Promise<UserProfile> => {
      const response = await api.get<UserProfile>('/auth/me');

      return response.data;
    },
    enabled,
  });
}
