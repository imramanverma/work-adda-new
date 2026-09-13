"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "WORKER" | "EMPLOYER" | "ADMIN";
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isVerified: boolean;
  profileImage?: string | null;
  unreadNotificationsCount?: number;
  workerProfile?: any;
  employerProfile?: any;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  quickLogin: (role: "WORKER" | "EMPLOYER" | "ADMIN") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Login Failed", data.error || "Invalid credentials");
        return { success: false, error: data.error };
      }

      toast.success("Welcome back!", `Signed in as ${data.user.name}`);
      await refreshUser();
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      }
      return { success: true, redirectUrl: data.redirectUrl };
    } catch (err: any) {
      toast.error("Network Error", err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Registration Failed", data.error || "Please check the form inputs");
        return { success: false, error: data.error };
      }

      toast.success("Welcome to Work Adda! 🎉", "Your account has been created.");
      await refreshUser();
      const redirectUrl = formData.role === "EMPLOYER" ? "/employer/dashboard" : "/worker/dashboard";
      router.push(redirectUrl);
      return { success: true, redirectUrl };
    } catch (err: any) {
      toast.error("Network Error", err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      toast.info("Logged Out", "You have been safely signed out.");
      router.push("/login");
      router.refresh();
    } catch (err: any) {
      toast.error("Error signing out", err.message);
    }
  };

  const quickLogin = async (role: "WORKER" | "EMPLOYER" | "ADMIN") => {
    const creds = {
      WORKER: { identifier: "worker@workadda.com", password: "password123" },
      EMPLOYER: { identifier: "employer@workadda.com", password: "password123" },
      ADMIN: { identifier: "admin@workadda.com", password: "password123" },
    };

    const target = creds[role];
    await login(target.identifier, target.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
