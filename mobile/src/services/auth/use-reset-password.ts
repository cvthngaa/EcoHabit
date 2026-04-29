import { useMutation } from '@tanstack/react-query';
import api from '../api-client';
import { AuthResponse, ResetPasswordPayload } from './types';

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ email, newPassword }: ResetPasswordPayload): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/auth/reset-password', {
        email,
        newPassword,
      });

      return response.data;
    },
  });
}
