import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api-client';

export function useSendOtp() {
  return useMutation({
    mutationFn: async (email: string): Promise<{ message: string }> => {
      const res = await apiClient.post<{ message: string }>('/auth/send-otp', { email });
      return res.data;
    },
  });
}
