import api from './interceptor';

export const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', {
        email,
        password,
    });

    return res.data;
};

export const sendOtp = async (email: string) => {
    const res = await api.post('/auth/send-otp', {
        email,
    });

    return res.data;
};

export const verifyOtp = async (email: string, otp: string) => {
    const res = await api.post('/auth/verify-otp', {
        email,
        otp,
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

export const sendPasswordResetOtp = async (email: string) => {
    const res = await api.post('/auth/forgot-password/send-otp', {
        email,
    });

    return res.data;
};

export const resetPassword = async (email: string, newPassword: string) => {
    const res = await api.post('/auth/reset-password', {
        email,
        newPassword,
    });

    return res.data;
};
