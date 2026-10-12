import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { IUser } from "../types/auth.types";
import axiosInstance, {
  refreshAccessToken,
  setSessionExpiredHandler,
  tokenRef,
} from "../api/axiosInstance";
import { AuthContext } from "./auth.context";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      toast.info("Your session ended. Please log in again.", {
        id: "session-expired",
      });
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshAccessToken();
        const { data } = await axiosInstance.get("/auth/me");
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchUser = useCallback(async () => {
    const { data } = await axiosInstance.get("/auth/me");
    setUser(data.user);
  }, []);

  const login = useCallback<AuthValue["login"]>(
    async (userData) => {
      const { data } = await axiosInstance.post("/auth/login", userData);
      tokenRef.current = data.accessToken;
      await fetchUser();
    },
    [fetchUser],
  );

  const signup = useCallback<AuthValue["signup"]>(
    async (userData) => {
      const { data } = await axiosInstance.post("/auth/signup", userData);
      tokenRef.current = data.accessToken;
      await fetchUser();
    },
    [fetchUser],
  );

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      tokenRef.current = null;
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, signup, logout }),
    [user, isLoading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

type AuthValue = NonNullable<React.ContextType<typeof AuthContext>>;
