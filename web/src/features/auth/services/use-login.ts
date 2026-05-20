import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api-client';
import type { LoginResponse } from './types';

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }: Record<string, string>): Promise<LoginResponse> => {
      const res = await apiClient.post<LoginResponse>('/auth/login', { email, password });
      if (res.data.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        if (res.data.partnerProfile) {
          localStorage.setItem('partnerProfile', JSON.stringify(res.data.partnerProfile));
        }
      }
      return res.data;
    },
  });
}
