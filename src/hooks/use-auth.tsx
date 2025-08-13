
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut as fbSignOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { findOrCreateUserFromGoogle } from "@/lib/actions/auth";

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      if (firebaseUser && firebaseUser.email && firebaseUser.displayName && firebaseUser.uid) {
        // User is signed in with Firebase. Ensure they exist in our database.
        const result = await findOrCreateUserFromGoogle({
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          uid: firebaseUser.uid,
        });

        if (result.success && result.user) {
          setUser(result.user); // Set our app's user object
        } else {
          // If we can't get a user from our DB, something is wrong. Sign out.
          await fbSignOut(auth);
          setUser(null);
        }
      } else {
        // User is signed out.
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);


  // This function is now only for manual, email/password login flow
  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fbSignOut(auth);
      setUser(null);
      router.push("/login");
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
        setIsLoading(false);
    }
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
