import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (payload: any) => Promise<string>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('lms_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('lms_token');
      if (savedToken) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          localStorage.setItem('lms_user', JSON.stringify(profile));
        } catch (err) {
          console.error("Auth refresh failed:", err);
          localStorage.removeItem('lms_token');
          localStorage.removeItem('lms_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<string> => {
    const result = await authService.login(email, password);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem('lms_token', result.token);
    localStorage.setItem('lms_user', JSON.stringify(result.user));
    return result.redirect_url;
  };

  const register = async (payload: any): Promise<string> => {
    const result = await authService.register(payload);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem('lms_token', result.token);
    localStorage.setItem('lms_user', JSON.stringify(result.user));
    return result.redirect_url;
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...userData };
    setUser(updated);
    localStorage.setItem('lms_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!token && !!user,
        role: user ? user.role : null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
