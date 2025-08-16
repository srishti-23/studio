
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut as fbSignOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { findOrCreateUserFromGoogle, logout as serverLogout, getCurrentUser } from "@/lib/actions/auth";
import { useToast } from "./use-toast";

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
  const { toast } = useToast();

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
      // Check if there's a Firebase user but no server-side user yet.
      // This is the primary condition for a new Google Sign-In.
      if (firebaseUser && !user) {
        if (firebaseUser.email && firebaseUser.displayName && firebaseUser.uid) {
            setIsLoading(true);
            const result = await findOrCreateUserFromGoogle({
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              uid: firebaseUser.uid,
            });

            if (result.success && result.user) {
              setUser(result.user); // Update client state
              toast({ title: "Sign-In Successful", description: "Welcome!" });
              // The server cookie is now set, so we can safely redirect.
              router.push('/');
            } else {
               toast({ variant: "destructive", title: "Sign-In Failed", description: result.message || "Could not sync your account." });
               await fbSignOut(auth);
               setUser(null);
            }
            setIsLoading(false);
        }
      } else if (!firebaseUser) {
        // If firebase says no user, ensure our local state is also cleared.
        // This handles cases where the user might have been deleted from Firebase console.
        if (user) {
           await serverLogout();
           setUser(null);
        }
      }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


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
