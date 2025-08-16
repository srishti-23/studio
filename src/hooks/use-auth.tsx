
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut as fbSignOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { logout as serverLogout, getCurrentUser } from "@/lib/actions/auth";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This effect runs once on mount to check for an existing session from the cookie.
    // It establishes the initial auth state.
    const checkUserSession = async () => {
      const userFromCookie = await getCurrentUser();
      if (userFromCookie) {
        setUser(userFromCookie);
      }
      setIsLoading(false);
    };

    checkUserSession();

    // Firebase listener for client-side auth state changes (e.g., logout from another tab).
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser && user) {
        // If Firebase says no user, and we have a user in state, it means a logout happened.
        // We ensure server and client state are cleared.
        await serverLogout();
        setUser(null);
        router.push("/login");
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const login = (userData: User) => {
    // This function is called after successful login (email/pass or Google).
    // The server action has already set the cookie. We just update the client state.
    setIsLoading(true);
    setUser(userData);
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fbSignOut(auth); // Sign out from firebase client
    } catch (e) {
      console.error("Firebase sign out failed, continuing with server logout.", e);
    }
    await serverLogout(); // Sign out from server (clear cookie)
    setUser(null); // Clear client state
    router.push("/login");
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
