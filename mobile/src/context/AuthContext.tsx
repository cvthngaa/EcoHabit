import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { clearSessionIfNotRemembered, logout as clearStoredToken } from '../store/auth.store';

interface AuthContextType {
  isLoggedIn: boolean;
  isHydrating: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isHydrating: true,
  login: () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Nếu user không tick "Ghi nhớ" → token bị xoá → phải đăng nhập lại
        const hasValidSession = await clearSessionIfNotRemembered();
        setIsLoggedIn(hasValidSession);
      } finally {
        setIsHydrating(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(() => setIsLoggedIn(true), []);
  const logout = useCallback(async () => {
    await clearStoredToken();
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isHydrating, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
