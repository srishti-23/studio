
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';


interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
        const storedUser = getCookie('user');
        if (typeof storedUser === 'string') {
          setUser(JSON.parse(storedUser));
        }
    } catch(e) {
        // ignore parsing errors
        deleteCookie('user');
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setCookie('user', JSON.stringify(userData), { maxAge: 60 * 60 * 24 * 7 }); // 7 days
    setUser(userData);
  };

  const logout = () => {
    deleteCookie('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
