import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// ─── Token helpers (localStorage) ────────────────────────────────────────────
const TOKEN_KEY = 'access_token';

export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// ─── Auth Context (React-level session state) ─────────────────────────────────
// Rule: Dùng AuthProvider để cung cấp isLoggedIn state cho toàn app.
// Rule: Dùng saveToken/getToken/clearToken cho logic bất đồng bộ (Axios interceptor).

type AuthContextValue = {
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
};

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!getToken());
  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
