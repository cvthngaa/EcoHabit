import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api-client';
import { UpdateUserProfilePayload, UserProfile } from './types';
import { profileQueryKey } from './use-get-profile';

export function useUpdateProfile() {
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: async (payload: UpdateUserProfilePayload): Promise<UserProfile> => {
 const response = await api.patch<UserProfile>('/auth/me', payload);
 return response.data;
 },
 onSuccess: (profile) => {
 queryClient.setQueryData(profileQueryKey, profile);
 void queryClient.invalidateQueries({ queryKey: profileQueryKey });
 },
 });
}
