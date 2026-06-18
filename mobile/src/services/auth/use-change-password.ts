import { useMutation } from '@tanstack/react-query';
import api from '../api-client';

export type ChangePasswordPayload = {
 oldPassword?: string;
 newPassword: string;
};

export function useChangePassword() {
 return useMutation({
 mutationFn: async (payload: ChangePasswordPayload) => {
 const response = await api.post('/auth/change-password', payload);
 return response.data;
 },
 });
}
