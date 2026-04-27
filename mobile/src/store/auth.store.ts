import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'token';
const REMEMBER_KEY = 'remember_me';

export const saveToken = async (token: string, remember: boolean) => {
    if (remember) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.setItem(REMEMBER_KEY, 'true');
    } else {
        // Lưu token cho phiên hiện tại
        await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.setItem(REMEMBER_KEY, 'false');
    }
};

export const getToken = async () => {
    return await AsyncStorage.getItem(TOKEN_KEY);
};

export const getRememberMe = async (): Promise<boolean> => {
    const value = await AsyncStorage.getItem(REMEMBER_KEY);
    return value === 'true';
};

/**
 * Gọi khi app khởi động: nếu user không tick "Ghi nhớ",
 * xoá token để buộc đăng nhập lại.
 */
export const clearSessionIfNotRemembered = async (): Promise<boolean> => {
    const remember = await getRememberMe();
    if (!remember) {
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(REMEMBER_KEY);
        return false; // không có phiên hợp lệ
    }
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return Boolean(token); // có phiên hợp lệ nếu có token
};

export const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(REMEMBER_KEY);
};