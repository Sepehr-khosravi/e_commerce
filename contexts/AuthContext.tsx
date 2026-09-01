"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  phoneNumber: string;
  phoneVerified: boolean;
  firstName: string;
  lastName: string;
  address?: string | null;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
  requireAuth: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();

      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const requireAuth = useCallback(async () => {
    /*
     * If we already know the user is authenticated,
     * no additional request is necessary.
     */
    if (user) {
      return true;
    }

    /*
     * If we don't know yet, check the server.
     */
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        const redirect =
          window.location.pathname +
          window.location.search;

        router.push(
          `/login?redirect=${encodeURIComponent(redirect)}`
        );

        return false;
      }

      const data = await response.json();

      if (!data.authenticated || !data.user) {
        const redirect =
          window.location.pathname +
          window.location.search;

        router.push(
          `/login?redirect=${encodeURIComponent(redirect)}`
        );

        return false;
      }

      setUser(data.user);

      return true;
    } catch (error) {
      console.error("Authentication error:", error);

      const redirect =
        window.location.pathname +
        window.location.search;

      router.push(
        `/login?redirect=${encodeURIComponent(redirect)}`
      );

      return false;
    }
  }, [user, router]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      router.refresh();
      router.push("/");
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        refreshAuth,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}