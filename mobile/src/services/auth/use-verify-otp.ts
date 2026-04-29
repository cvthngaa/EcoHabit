import { useMutation } from '@tanstack/react-query';
import api from '../api-client';
import { AuthResponse, VerifyOtpPayload } from './types';

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async ({ email, otp }: VerifyOtpPayload): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/auth/verify-otp', {
        email,
        otp,
      });

      return response.data;
    },
  });
}
