
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
    // Check for an existing cookie session first
    getCurrentUser().then(cookieUser => {
        if (cookieUser) {
            setUser(cookieUser);
        }
    }).finally(() => {
        // Then, set up the Firebase listener.
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          setIsLoading(true);
          if (firebaseUser && firebaseUser.email && firebaseUser.displayName && firebaseUser.uid) {
            // User is signed in with Firebase. Ensure they exist in our database and set the cookie.
            const result = await findOrCreateUserFromGoogle({
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              uid: firebaseUser.uid,
            });
    
            if (result.success && result.user) {
              setUser(result.user); 
              await setCurrentUser(result.user);
            } else {
              // If we can't get a user from our DB, something is wrong. Sign out.
              await fbSignOut(auth);
              setUser(null);
              await serverLogout();
            }
          } else {
            // User is signed out from Firebase, but might still have a cookie session
            // from email/password login. Let's re-verify the cookie.
            const stillLoggedInUser = await getCurrentUser();
            if (!stillLoggedInUser) {
              setUser(null); // No firebase user, no cookie. Definitely logged out.
            }
          }
          setIsLoading(false);
        });
        
        // Initial loading is done after both cookie check and Firebase listener are ready.
        if (isLoading) setIsLoading(false);

        // Cleanup subscription on unmount
        return () => unsubscribe();
    });
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    // The cookie is already set by the server action that performs the login
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fbSignOut(auth); // Sign out from firebase client
    } catch (e) {
      console.error("Firebase sign out failed, continuing with server logout.", e);
    }
    try {
      await serverLogout(); // Sign out from server (clear cookie)
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
