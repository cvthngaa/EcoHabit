import { useQuery } from '@tanstack/react-query';
import api from '../api/interceptor';

export interface MyQrResponse {
 qrToken: string;
}

export function useGetMyQr(options?: { enabled?: boolean }) {
 return useQuery({
 queryKey: ['my-qr'],
 queryFn: async (): Promise<MyQrResponse> => {
 const { data } = await api.get('/auth/me/qr');
 return data;
 },
 ...options,
 });
}
