
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { findOrCreateUserFromGoogle } from '@/lib/actions/auth';


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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
            // User is signed in with Firebase, now check our DB
            try {
                const cookieUser = getCookie('user');
                if (cookieUser && typeof cookieUser === 'string') {
                    setUser(JSON.parse(cookieUser));
                } else if (firebaseUser.email && firebaseUser.displayName && firebaseUser.uid) {
                     // This handles the case where the cookie is gone but user is still logged into firebase
                    const result = await findOrCreateUserFromGoogle({
                        email: firebaseUser.email,
                        name: firebaseUser.displayName,
                        uid: firebaseUser.uid,
                    });
                    if (result.success && result.user) {
                        login(result.user);
                    } else {
                        await signOut(auth);
                    }
                }
            } catch (e) {
                 await signOut(auth);
            }
        } else {
            // User is signed out
            setUser(null);
            deleteCookie('user');
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: User) => {
    setCookie('user', JSON.stringify(userData), { maxAge: 60 * 60 * 24 * 7 }); // 7 days
    setUser(userData);
  };

  const logout = async () => {
    await signOut(auth);
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
