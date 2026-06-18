import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import api from '../api-client';
import { UserRedemptionsResponse } from './types';

export const myRedemptionsQueryKey = ['redemptions', 'me'] as const;

export function useGetMyRedemptions(
 options?: Omit<
 UseQueryOptions<UserRedemptionsResponse, Error, UserRedemptionsResponse, typeof myRedemptionsQueryKey>,
 'queryKey' | 'queryFn'
 >,
) {
 return useQuery({
 queryKey: myRedemptionsQueryKey,
 queryFn: async () => {
 const response = await api.get<UserRedemptionsResponse>('/redemptions/me');

 return response.data;
 },
 ...options,
 });
}
