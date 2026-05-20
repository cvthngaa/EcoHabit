import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api-client';

export function useForgotPasswordOtp() {
  return useMutation({
    mutationFn: async (email: string): Promise<{ message: string }> => {
      const res = await apiClient.post<{ message: string }>('/auth/forgot-password/send-otp', { email });
      return res.data;
    },
  });
}
