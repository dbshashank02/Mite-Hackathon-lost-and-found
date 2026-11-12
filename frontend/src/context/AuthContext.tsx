'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '../types';
import { api } from '../lib/api';
import { DEMO_USERS } from '../lib/mockData';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<User>;
  register: (email: string, name: string, role: UserRole, department?: string) => Promise<User>;
  quickLogin: (role: UserRole) => Promise<User>;
  switchRole: (role: UserRole) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const roleRouteMap: Record<UserRole, string> = {
  STUDENT: '/dashboard/student',
  FINDER: '/dashboard/finder',
  SECURITY: '/dashboard/security',
  ADMIN: '/dashboard/admin',
};

export function detectRoleFromEmail(email: string): UserRole {
  const lower = email.toLowerCase();
  if (lower.includes('admin') || lower.includes('dean') || lower.includes('provost')) return 'ADMIN';
  if (lower.includes('security') || lower.includes('police') || lower.includes('guard')) return 'SECURITY';
  if (lower.includes('finder') || lower.includes('samaritan')) return 'FINDER';
  return 'STUDENT';
}

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

  const login = async (email: string, specifiedRole?: UserRole): Promise<User> => {
    const role = specifiedRole || detectRoleFromEmail(email);
    const res = await api.login(email, role);
    setUser(res.user);
    setToken(res.token);
    try {
      localStorage.setItem('findit_user', JSON.stringify(res.user));
      localStorage.setItem('findit_token', res.token);
    } catch (e) {}

    router.push(roleRouteMap[res.user.role || role]);
    return res.user;
  };

  const register = async (
    email: string,
    name: string,
    role: UserRole,
    department: string = 'Campus Member'
  ): Promise<User> => {
    const res = await api.login(email, role);
    const updatedUser: User = {
      ...res.user,
      handle: name || res.user.handle,
      department: department || res.user.department,
      role,
    };

    setUser(updatedUser);
    setToken(res.token);
    try {
      localStorage.setItem('findit_user', JSON.stringify(updatedUser));
      localStorage.setItem('findit_token', res.token);
    } catch (e) {}

    router.push(roleRouteMap[role]);
    return updatedUser;
  };

  const quickLogin = async (role: UserRole): Promise<User> => {
    const demo = DEMO_USERS[role];
    return await login(demo.email, role);
  };

  const switchRole = async (newRole: UserRole): Promise<User> => {
    const currentEmail = user?.email || DEMO_USERS[newRole].email;
    return await login(currentEmail, newRole);
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
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        quickLogin,
        switchRole,
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
