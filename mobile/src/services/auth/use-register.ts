import { useMutation } from '@tanstack/react-query';
import api from '../api-client';
import { AuthResponse, RegisterPayload } from './types';

export function useRegister() {
  return useMutation({
    mutationFn: async ({ email, password, fullName }: RegisterPayload): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/auth/register', {
        email,
        password,
        fullName,
      });

      return response.data;
    },
  });
}
