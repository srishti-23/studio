
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut as fbSignOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { findOrCreateUserFromGoogle, setCurrentUser, logout as serverLogout, getCurrentUser } from "@/lib/actions/auth";

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
    getCurrentUser().then(userFromCookie => {
      if (userFromCookie) {
        setUser(userFromCookie);
      }
      setIsLoading(false);
    });

    // Firebase listener for client-side auth changes (e.g. Google Sign-In)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.email && firebaseUser.displayName && firebaseUser.uid) {
        // User signed in with Google on the client.
        // We ensure a server session (cookie) is created/updated for them.
        setIsLoading(true);
        const result = await findOrCreateUserFromGoogle({
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          uid: firebaseUser.uid,
        });

        if (result.success && result.user) {
          setUser(result.user); // Update client state
          // Server cookie is now set by findOrCreateUserFromGoogle, so server actions will work.
        } else {
           console.error("Failed to find or create user from Google Sign-In.");
           await fbSignOut(auth);
           setUser(null);
        }
        setIsLoading(false);
      } else {
        // This handles when a user signs out via Firebase methods, but the cookie might still exist.
        // The `logout` function is the primary way to sign out, which clears both.
        // If they are not the same, we trust the server-side session.
        const userFromCookie = await getCurrentUser();
        if (!userFromCookie) {
            setUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);


  const login = (userData: User) => {
    // This function is called after successful email/password login.
    // The server action has already set the cookie. We just update the client state.
    setUser(userData);
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
