'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '../types';
import { api } from '../lib/api';
import { DEMO_USERS } from '../lib/mockData';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, role: UserRole) => Promise<User>;
  quickLogin: (role: UserRole) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const roleRouteMap: Record<UserRole, string> = {
  STUDENT: '/dashboard/student',
  FINDER: '/dashboard/finder',
  SECURITY: '/dashboard/security',
  ADMIN: '/dashboard/admin',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('findit_user');
      const storedToken = localStorage.getItem('findit_token');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (e) {
      console.warn('Failed to parse stored auth session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, role: UserRole): Promise<User> => {
    const res = await api.login(email, role);
    setUser(res.user);
    setToken(res.token);
    try {
      localStorage.setItem('findit_user', JSON.stringify(res.user));
      localStorage.setItem('findit_token', res.token);
    } catch (e) {}

    router.push(roleRouteMap[role]);
    return res.user;
  };

  const quickLogin = async (role: UserRole): Promise<User> => {
    const demo = DEMO_USERS[role];
    return await login(demo.email, role);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('findit_user');
      localStorage.removeItem('findit_token');
    } catch (e) {}
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
