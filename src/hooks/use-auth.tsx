
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut as fbSignOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { findOrCreateUserFromGoogle, getCurrentUser, logout as serverLogout } from "@/lib/actions/auth";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;   // sets client state only
  logout: () => Promise<void>;   // calls server to clear cookie
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 1) Hydrate from server httpOnly cookie on first load/refresh
  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        const serverUser = await getCurrentUser();
        if (serverUser) setUser(serverUser);
      } finally {
        setIsLoading(false);
        // 2) Then attach Firebase listener (for Google sign-in path only)
        unsub = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          // If we already have an app user, we’re good.
          if (user) return;

          if (firebaseUser && firebaseUser.email && firebaseUser.displayName && firebaseUser.uid) {
            setIsLoading(true);
            // Make sure user exists in our DB and httpOnly cookie is set by the server action.
            const result = await findOrCreateUserFromGoogle({
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              uid: firebaseUser.uid,
            });
            if (result?.success && result.user) {
              setUser(result.user); // server action already set cookie; we only set state
            } else {
              await fbSignOut(auth).catch(() => {});
              setUser(null);
            }
            setIsLoading(false);
          } else {
            // No Firebase user — do NOT try to delete server cookie here.
            // Server cookie is managed by server actions (login/logout).
          }
        });
        // If there is no firebase configured, ensure loading state ends.
        if (!auth) setIsLoading(false);
      }
    })();

    return () => {
      if (unsub) unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side login just sets local state (server action already set the cookie)
  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Clear httpOnly cookie on the server
      await serverLogout();
    } catch (e) {
      // ignore
    }
    try {
      // If Firebase was used, also sign it out
      if (auth.currentUser) {
        await fbSignOut(auth);
      }
    } catch (e) {
      // ignore
    }
    setUser(null);
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
