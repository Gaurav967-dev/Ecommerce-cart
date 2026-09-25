"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type JwtInfo = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  hasSignature: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  accessTokenExpiresAt: number | null;
  refreshTokenExpiresAt: number | null;
  lastRefreshAt: number | null;
  jwt: JwtInfo | null;
  reload: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
};

const AuthContext =
  createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] = useState(true);

  const [accessTokenExpiresAt, setAccessTokenExpiresAt] =
    useState<number | null>(null);

  const [refreshTokenExpiresAt, setRefreshTokenExpiresAt] =
    useState<number | null>(null);

  const [lastRefreshAt, setLastRefreshAt] =
    useState<number | null>(null);

  const [jwt, setJwt] =
    useState<JwtInfo | null>(null);

  const loadSession = useCallback(
    async (allowRefresh = true) => {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            cache: "no-store",
          }
        );

        if (response.ok) {
          const data = await response.json();

          setUser(data.user);
          setAccessTokenExpiresAt(
            data.accessTokenExpiresAt
          );
          setRefreshTokenExpiresAt(
            data.refreshTokenExpiresAt
          );
          setJwt(data.jwt);

          return;
        }

        if (
          response.status === 401 &&
          allowRefresh
        ) {
          const refreshResponse = await fetch(
            "/api/auth/refresh",
            {
              method: "POST",
            }
          );

          if (refreshResponse.ok) {
            setLastRefreshAt(Date.now());

            await loadSession(false);

            return;
          }
        }

        setUser(null);
        setAccessTokenExpiresAt(null);
        setRefreshTokenExpiresAt(null);
        setJwt(null);
      } catch {
        setUser(null);
      }
    },
    []
  );

  const reload = useCallback(async () => {
    setLoading(true);

    await loadSession(true);

    setLoading(false);
  }, [loadSession]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/auth/refresh",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        setUser(null);
        return false;
      }

      setLastRefreshAt(Date.now());

      await loadSession(false);

      return true;
    } catch {
      setUser(null);
      return false;
    }
  }, [loadSession]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    setUser(null);
    setAccessTokenExpiresAt(null);
    setRefreshTokenExpiresAt(null);
    setLastRefreshAt(null);
    setJwt(null);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!user || !accessTokenExpiresAt) {
      return;
    }

    const millisecondsUntilRefresh =
      accessTokenExpiresAt -
      Date.now() -
      5000;

    const timeout = setTimeout(
      () => {
        refreshToken();
      },
      Math.max(millisecondsUntilRefresh, 1000)
    );

    return () => clearTimeout(timeout);
  }, [
    user,
    accessTokenExpiresAt,
    refreshToken,
  ]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        lastRefreshAt,
        jwt,
        reload,
        logout,
        refreshToken,
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