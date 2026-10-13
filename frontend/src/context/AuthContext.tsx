import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, HealthStatus } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  health: HealthStatus | null;
  login: (email: string, pass: string) => Promise<User>;
  register: (payload: { full_name: string; email: string; password: string; department: string; semester: number }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const fetchSessionAndHealth = async () => {
    try {
      const [meRes, healthRes] = await Promise.allSettled([
        api.auth.me(),
        api.health.check(),
      ]);

      if (meRes.status === 'fulfilled' && meRes.value.success) {
        setUser(meRes.value.user);
      } else {
        setUser(null);
      }

      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndHealth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.auth.login({ email, password: pass });
    setUser(res.user);
    return res.user;
  };

  const register = async (payload: { full_name: string; email: string; password: string; department: string; semester: number }) => {
    const res = await api.auth.register(payload);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await api.auth.me();
    if (res.success) {
      setUser(res.user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, health, login, register, logout, refreshUser }}>
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
