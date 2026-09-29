"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

type LoginResult = {
  success: boolean;
  error?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;

  accessToken: string | null;
  accessTokenExpiresAt: number | null;
  refreshTokenExpiresAt: number | null;

  lastRefreshAt: number | null;

  login: (
    email: string,
    password: string
  ) => Promise<LoginResult>;

  logout: () => Promise<void>;

  refreshToken: () => Promise<boolean>;

  updateUser: (user: User) => void;

  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => Promise<Response>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [accessTokenExpiresAt, setAccessTokenExpiresAt] = useState<number | null>(null);

  const [refreshTokenExpiresAt, setRefreshTokenExpiresAt] = useState<number | null>(null);
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);

  const accessTokenRef = useRef<string | null>(null);
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);
  
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  const setNewAccessToken = useCallback(
    (
      token: string | null,
      expiresAt: number | null
    ) => {
      accessTokenRef.current = token;

      setAccessToken(token);

      setAccessTokenExpiresAt(expiresAt);
    },
    []
  );

  const clearAuth = useCallback(() => {
    setUser(null);

    setNewAccessToken(null, null);

    setRefreshTokenExpiresAt(null);
  }, [setNewAccessToken]);

  const refreshToken =
    useCallback(async (): Promise<boolean> => {
      if (refreshPromiseRef.current) {
        return refreshPromiseRef.current;
      }

      const refreshPromise =
        (async () => {
          try {
            const response = await fetch(
              "/api/auth/refresh",
              {
                method: "POST",
                credentials: "include",
                cache: "no-store",
              }
            );

            if (!response.ok) {
              clearAuth();
              return false;
            }

            const data =
              await response.json();

            if (!data.accessToken) {
              clearAuth();
              return false;
            }

            setNewAccessToken(
              data.accessToken,
              data.accessTokenExpiresAt
            );

            setRefreshTokenExpiresAt(
              data.refreshTokenExpiresAt ??
                null
            );

            if (data.user) {
              setUser(data.user);
            }

            setLastRefreshAt(Date.now());

            return true;
          } catch (error) {
            console.error(
              "Refresh failed:",
              error
            );

            clearAuth();

            return false;
          }
        })();

      refreshPromiseRef.current =
        refreshPromise;

      try {
        return await refreshPromise;
      } finally {
        refreshPromiseRef.current = null;
      }
    }, [
      clearAuth,
      setNewAccessToken,
    ]);

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      await refreshToken();

      if (active) {
        setLoading(false);
      }
    };

    void initializeAuth();

    return () => {
      active = false;
    };
  }, [refreshToken]);

  useEffect(() => {
    if (!accessTokenExpiresAt) {
      return;
    }

    const REFRESH_EARLY_MS = 5 * 1000;

    const delay =
      accessTokenExpiresAt -
      Date.now() -
      REFRESH_EARLY_MS;

    if (delay <= 0) {
      void refreshToken();
      return;
    }

    const timer = window.setTimeout(
      () => {
        void refreshToken();
      },
      delay
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    accessTokenExpiresAt,
    refreshToken,
  ]);

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<LoginResult> => {
      try {
        const response = await fetch(
          "/api/auth/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          return {
            success: false,
            error:
              data.error ??
              "Login failed",
          };
        }

        setUser(data.user);

        setNewAccessToken(
          data.accessToken,
          data.accessTokenExpiresAt
        );

        setRefreshTokenExpiresAt(
          data.refreshTokenExpiresAt ??
            null
        );

        return {
          success: true,
        };
      } catch {
        return {
          success: false,
          error: "Unable to login",
        };
      }
    },
    [setNewAccessToken]
  );

  const logout =
    useCallback(async () => {
      try {
        await fetch(
          "/api/auth/logout",
          {
            method: "POST",
            credentials: "include",
          }
        );
      } finally {
        clearAuth();

        setLastRefreshAt(null);
      }
    }, [clearAuth]);

  const authFetch =
    useCallback(
      async (
        input: RequestInfo | URL,
        init: RequestInit = {}
      ) => {
        if (!accessTokenRef.current) {
          await refreshToken();
        }

        const makeRequest = async () => {
          const headers =
            new Headers(init.headers);

          const token =
            accessTokenRef.current;

          if (token) {
            headers.set(
              "Authorization",
              `Bearer ${token}`
            );
          }

          return fetch(input, {
            ...init,
            headers,
          });
        };

        let response =
          await makeRequest();

        if (response.status === 401) {
          const refreshed =
            await refreshToken();

          if (refreshed) {
            response =
              await makeRequest();
          }
        }

        return response;
      },
      [refreshToken]
    );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,

        accessToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,

        lastRefreshAt,

        login,
        logout,
        refreshToken,
        updateUser,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}