"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { useUiStore } from "@/store/uiStore";

interface User {
  id: number;
  username: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider context manager.
 * Wires profile fetching, token storage, and session login/logout gates.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const addToast = useUiStore((state) => state.addToast);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
          try {
            const response = await apiClient.get<User>("/auth/me");
            setUser(response.data);
          } catch (error) {
            console.error("Failed to load user profile with token", error);
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiClient.post<{ access_token: string; token_type: string }>(
        "/auth/login-json",
        { username, password }
      );
      
      const { access_token } = response.data;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", access_token);
      }
      setToken(access_token);
      
      const meResponse = await apiClient.get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      setUser(meResponse.data);
      addToast("Successfully logged in", "success");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login failed", error);
      const detail = error.response?.data?.detail || "Invalid credentials";
      addToast(detail, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setToken(null);
    setUser(null);
    addToast("Logged out successfully", "info");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
