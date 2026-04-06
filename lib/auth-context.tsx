"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  user: { username: string } | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

const VALID_USERS: Record<string, string> = {
  "Zack": "@LunaTuna$",
  "Flip": "KingChapo$",
};
const STORAGE_KEY = "zs_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    if (VALID_USERS[username] && VALID_USERS[username] === password) {
      const u = { username };
      setUser(u);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      return { error: null };
    }
    return { error: "Invalid credentials" };
  };

  const signOut = async () => {
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
