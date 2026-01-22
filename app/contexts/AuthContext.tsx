"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getStorageItem, setStorageItem, removeStorageItem } from "../lib/storage";

interface User {
  id: number;
  name: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
  workspaces: Workspace[];
}

interface Workspace {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (sessionToken: string, userData?: Partial<User>, workspaces?: Workspace[]) => Promise<void>;
  logout: () => void;
  fetchUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserInfo = async () => {
    try {
      const sessionToken = getStorageItem("sessionToken");
      
      if (!sessionToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/user-info", {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Session expired or invalid
          removeStorageItem("sessionToken");
          setUser(null);
          setLoading(false);
          return;
        }
        throw new Error("Failed to fetch user info");
      }

      const data = await response.json();
      setUser({
        ...data.user,
        workspaces: data.workspaces || [],
      });
    } catch (error) {
      console.error("Error fetching user info:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (sessionToken: string, userData?: Partial<User>, workspaces?: Workspace[]) => {
    setStorageItem("sessionToken", sessionToken);
    
    // If userData is provided, use it temporarily until we fetch from API
    if (userData) {
      setUser({
        id: userData.id!,
        name: userData.name ?? null,
        email: userData.email!,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: userData.updatedAt || new Date().toISOString(),
        workspaces: workspaces || [],
      });
    }
    
    // Fetch complete user info from API
    await fetchUserInfo();
  };

  const logout = () => {
    removeStorageItem("sessionToken");
    setUser(null);
    router.push("/login");
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        fetchUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

