import { api } from './api';
import { getToken, logout } from '../../store/auth.store';

// REQUEST
api.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        console.log("Interceptor sending token:", token ? "Token OK" : "NO_TOKEN");

        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            console.log('Token hết hạn or Lỗi Xác Thực');
            await logout();
            console.log('Đã tự động xoá token cũ khỏi máy.');
        }

        return Promise.reject(error);
    }
);

export default api;