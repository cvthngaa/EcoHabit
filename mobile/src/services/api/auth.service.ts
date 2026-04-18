import api from './interceptor';

export const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', {
        email,
        password,
    });

    return res.data;
};

export const register = async (
    email: string,
    password: string,
    fullName: string
) => {
    const res = await api.post('/auth/register', {
        email,
        password,
        fullName,
    });

    return res.data;
};

export const getProfile = async () => {
    const res = await api.get('/auth/me');
    return res.data;
};