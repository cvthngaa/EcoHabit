import { useMutation } from '@tanstack/react-query';
import apiClient from '../api-client';

type SendChangePasswordOtpResponse = {
 message: string;
};

export const useSendChangePasswordOtp = () => {
  return useMutation<SendChangePasswordOtpResponse, Error, { oldPassword?: string } | void>({
    mutationFn: async (data) => {
      const response = await apiClient.post('/auth/change-password/send-otp', data || {});
      return response.data;
    },
  });
};
