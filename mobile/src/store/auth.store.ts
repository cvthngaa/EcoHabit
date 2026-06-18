import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'token';
const REMEMBER_KEY = 'remember_me';

export const saveToken = async (token: string, remember: boolean) => {
 await SecureStore.setItemAsync(TOKEN_KEY, token);
 await SecureStore.setItemAsync(REMEMBER_KEY, remember ? 'true' : 'false');
};

export const getToken = async (): Promise<string | null> => {
 return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const getRememberMe = async (): Promise<boolean> => {
 const value = await SecureStore.getItemAsync(REMEMBER_KEY);
 return value === 'true';
};

/**
 * Gọi khi app khởi động: nếu user không tick "Ghi nhớ",
 * xoá token để buộc đăng nhập lại.
 */
export const clearSessionIfNotRemembered = async (): Promise<boolean> => {
 const remember = await getRememberMe();
 if (!remember) {
 await SecureStore.deleteItemAsync(TOKEN_KEY);
 await SecureStore.deleteItemAsync(REMEMBER_KEY);
 return false; // không có phiên hợp lệ
 }
 const token = await SecureStore.getItemAsync(TOKEN_KEY);
 return Boolean(token); // có phiên hợp lệ nếu có token
};

export const logout = async () => {
 await SecureStore.deleteItemAsync(TOKEN_KEY);
 await SecureStore.deleteItemAsync(REMEMBER_KEY);
};