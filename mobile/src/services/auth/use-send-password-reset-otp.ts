import { useMutation } from '@tanstack/react-query';
import api from '../api-client';
import { AuthResponse, EmailPayload } from './types';

export function useSendPasswordResetOtp() {
  return useMutation({
    mutationFn: async ({ email }: EmailPayload): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/auth/forgot-password/send-otp', {
        email,
      });

      return response.data;
    },
  });
}
