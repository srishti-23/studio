
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
    console.log('[useAuth] Hook mounted. Checking for existing session.');
    // This effect runs once on mount to check for an existing session from the cookie.
    // It establishes the initial auth state.
    getCurrentUser().then(userFromCookie => {
      if (userFromCookie) {
        console.log('[useAuth] Found user in cookie:', userFromCookie);
        setUser(userFromCookie);
      } else {
        console.log('[useAuth] No user found in cookie.');
      }
      setIsLoading(false);
    });

    // Firebase listener for client-side auth changes (e.g. Google Sign-In)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('[useAuth] onAuthStateChanged triggered. Firebase user:', firebaseUser);
      // This listener is now primarily for handling sign-out events or if Firebase auth state
      // is restored from its own storage, but the primary login flow is handled in the form.
      if (!firebaseUser) {
        // If firebase says we're logged out, we should ensure our app state reflects that,
        // but only if there isn't a valid server session cookie.
        const userFromCookie = await getCurrentUser();
        if (!userFromCookie) {
            console.log('[useAuth] Firebase and server session agree: user is logged out.');
            setUser(null);
        } else {
             console.log('[useAuth] Firebase user is null, but server session exists. Trusting server session.');
             setUser(userFromCookie);
        }
      }
    });

    return () => {
      console.log('[useAuth] Unsubscribing from onAuthStateChanged.');
      unsubscribe();
    }
  }, []);


  const login = (userData: User) => {
    console.log('[useAuth] login function called with:', userData);
    // This function is called after successful login/signup.
    // The server action has already set the cookie. We just update the client state.
    setUser(userData);
  };

  const logout = async () => {
    console.log('[useAuth] logout function called.');
    setIsLoading(true);
    try {
      await fbSignOut(auth); // Sign out from firebase client
      console.log('[useAuth] Firebase sign out successful.');
    } catch (e) {
      console.error("[useAuth] Firebase sign out failed, continuing with server logout.", e);
    }
    await serverLogout(); // Sign out from server (clear cookie)
    console.log('[useAuth] Server logout successful.');
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
