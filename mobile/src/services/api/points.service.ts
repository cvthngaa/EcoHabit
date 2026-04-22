import api from './interceptor';

export const getPointHistory = async () => {
    const res = await api.get('/points/history');
    return res.data;
};
