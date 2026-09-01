'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, User } from './api';
import { getCookie, setCookie, deleteCookie } from './cookies';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isStaff: boolean;
  hasPermission: (perm: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }
    try {
      const savedToken = getCookie('kmlri_token') || localStorage.getItem('kmlri_token');
      if (!savedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      // Restore cached user profile immediately for 0ms UI hydration
      const cachedUser = localStorage.getItem('kmlri_user');
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {}
      }

      setToken(savedToken);
      setCookie('kmlri_token', savedToken);
      localStorage.setItem('kmlri_token', savedToken);

      // Verify and fetch fresh user profile
      const profile = await api.getMe();
      if (profile && profile.id) {
        setUser(profile);
        localStorage.setItem('kmlri_user', JSON.stringify(profile));
      }
    } catch (err) {
      console.warn('Session check expired or invalid, clearing stale credentials:', err);
      localStorage.removeItem('kmlri_token');
      localStorage.removeItem('kmlri_user');
      deleteCookie('kmlri_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, pass: string) => {
    const res = await api.login(identifier, pass);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kmlri_token', res.accessToken);
      localStorage.setItem('kmlri_user', JSON.stringify(res.user));
      setCookie('kmlri_token', res.accessToken);
    }
    setToken(res.accessToken);
    setUser(res.user);
    setLoading(false);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kmlri_token', res.accessToken);
      localStorage.setItem('kmlri_user', JSON.stringify(res.user));
      setCookie('kmlri_token', res.accessToken);
    }
    setToken(res.accessToken);
    setUser(res.user);
    setLoading(false);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kmlri_token');
      localStorage.removeItem('kmlri_user');
      deleteCookie('kmlri_token');
    }
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const hasPermission = (perm: string): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.role === 'super-admin') return true;

    // Check pre-computed effective permissions array
    if (Array.isArray(user.effectivePermissions) && user.effectivePermissions.includes(perm)) {
      return true;
    }

    // Check user-level permissions
    if (Array.isArray(user.permissions) && user.permissions.includes(perm)) {
      return true;
    }

    if (typeof user.permissions === 'string') {
      try {
        const parsed = JSON.parse(user.permissions);
        if (Array.isArray(parsed) && parsed.includes(perm)) return true;
      } catch {}
    }

    // Check roleRel permissions if present
    if (user.roleRel?.permissions) {
      try {
        const parsed = JSON.parse(user.roleRel.permissions);
        if (Array.isArray(parsed) && parsed.includes(perm)) return true;
      } catch {}
    }

    return false;
  };

  const isStaff =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'ADMIN' ||
    user?.role === 'LIBRARIAN' ||
    user?.role === 'super-admin' ||
    user?.role === 'librarian' ||
    user?.role === 'cataloger' ||
    hasPermission('ADMIN_ACCESS') ||
    hasPermission('CAN_ACCESS_ADMIN');

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, isStaff, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
