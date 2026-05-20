import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api-client';

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: Record<string, string>): Promise<{ message: string }> => {
      const res = await apiClient.post<{ message: string }>('/auth/reset-password', data);
      return res.data;
    },
  });
}
