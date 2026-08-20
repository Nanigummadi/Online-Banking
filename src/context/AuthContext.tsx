import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Wallet, WalletStats } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  walletStats: WalletStats | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  updateUserInState: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUserData = useCallback(async () => {
    const storedToken = localStorage.getItem('jwt_token');
    if (!storedToken) {
      setUser(null);
      setWallet(null);
      setWalletStats(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.getProfile();
      if (response.success && response.data) {
        setUser(response.data.user);
        setWallet(response.data.wallet);
        setWalletStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
      // If token expired or invalid, log out
      localStorage.removeItem('jwt_token');
      setToken(null);
      setUser(null);
      setWallet(null);
      setWalletStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      if (res.success && res.data) {
        const { token: newToken, user: newUser, wallet: newWallet } = res.data;
        localStorage.setItem('jwt_token', newToken);
        setToken(newToken);
        setUser(newUser);
        setWallet(newWallet || null);
        await refreshUserData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      if (res.success && res.data) {
        const { token: newToken, user: newUser, wallet: newWallet } = res.data;
        localStorage.setItem('jwt_token', newToken);
        setToken(newToken);
        setUser(newUser);
        setWallet(newWallet || null);
        await refreshUserData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
    setWallet(null);
    setWalletStats(null);
  };

  const updateUserInState = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        walletStats,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        refreshUserData,
        updateUserInState,
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
