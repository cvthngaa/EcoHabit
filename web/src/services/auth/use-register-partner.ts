import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { RegisterPartnerData } from './types';

export function useRegisterPartner() {
  return useMutation({
    mutationFn: async (data: RegisterPartnerData): Promise<{ message: string }> => {
      const res = await apiClient.post<{ message: string }>('/auth/register-partner', data);
      return res.data;
    },
  });
}
