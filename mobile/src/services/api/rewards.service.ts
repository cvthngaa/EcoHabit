import api from './interceptor';

export const getAllRewards = async () => {
    const res = await api.get('/rewards');
    return res.data;
};

export const getTopRewards = async (limit = 5) => {
    const res = await api.get('/rewards/top', { params: { limit } });
    return res.data;
};

export const redeemReward = async (rewardId: string) => {
    const res = await api.post('/rewards/redeem', { rewardId });
    return res.data;
};
