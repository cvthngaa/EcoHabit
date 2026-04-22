import api from './interceptor';

export const getClassificationHistory = async (limit: number = 3, page: number = 1) => {
    const res = await api.get('/ai/history', {
        params: { limit, page }
    });
    return res.data;
};
