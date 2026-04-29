import { useMutation } from '@tanstack/react-query';
import api from '../api-client';
import { LoginCredentials, LoginResponse } from './types';

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }: LoginCredentials): Promise<LoginResponse> => {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      return response.data;
    },
  });
}
