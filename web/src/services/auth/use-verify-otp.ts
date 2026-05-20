import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }): Promise<{ message: string }> => {
      const res = await apiClient.post<{ message: string }>('/auth/verify-otp', { email, otp });
      return res.data;
    },
  });
}
