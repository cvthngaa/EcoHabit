import { useMutation } from '@tanstack/react-query';
import api from '../api-client';
import { AuthResponse, EmailPayload } from './types';

export function useSendOtp() {
  return useMutation({
    mutationFn: async ({ email }: EmailPayload): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/auth/send-otp', {
        email,
      });

      return response.data;
    },
  });
}
