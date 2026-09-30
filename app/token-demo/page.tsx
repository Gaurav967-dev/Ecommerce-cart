"use client";

import { useEffect, useMemo, useState } from "react";

import { decodeJwt, decodeProtectedHeader } from "jose";

import { useAuth } from "@/components/AuthProvider";

function formatRemaining(
  expiresAt: number | null,
  now: number
) {
  if (!expiresAt) {
    return "N/A";
  }

  const remaining =
    Math.max(
      0,
      expiresAt - now
    );

  const seconds =
    Math.floor(remaining / 1000);

  const minutes =
    Math.floor(seconds / 60);

  const secondsLeft =
    seconds % 60;

  return `${minutes}m ${secondsLeft}s`;
}

export default function TokenDemoPage() {
  const {
    user,
    loading,

    accessToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,

    lastRefreshAt,

    refreshToken,
    authFetch,
  } = useAuth();

  const [now, setNow] =
    useState(Date.now());

  const [meResponse, setMeResponse] =
    useState<unknown>(null);

  useEffect(() => {
    const timer = window.setInterval(
      () => {
        setNow(Date.now());
      },
      1000
    );

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const decoded = useMemo(() => {
    if (!accessToken) {
      return null;
    }

    try {
      return {
        header:
          decodeProtectedHeader(
            accessToken
          ),

        payload:
          decodeJwt(accessToken),
      };
    } catch {
      return null;
    }
  }, [accessToken]);

  async function callProtectedMe() {
    const response =
      await authFetch(
        "http://localhost:8000/auth/me",
        {
          method: "GET",
          cache: "no-store",
        }
      );

    const data =
      await response.json();

    setMeResponse(data);
  }

  if (loading) {
    return (
      <main className="p-10">
        Loading...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-10">
        Please sign in.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-8 text-3xl font-bold">
        JWT Token Demo
      </h1>

      <div className="grid gap-6 md:grid-cols-2">

        <section className="rounded-2xl border p-6">
          <h2 className="mb-4 text-2xl font-semibold">
            Access Token
          </h2>

          <p>
            <strong>Status:</strong>{" "}
            {accessToken ? "Present" : "Missing"}
          </p>

          <p>
            <strong>
              Expires in:
            </strong>{" "}
            {formatRemaining(
              accessTokenExpiresAt,
              now
            )}
          </p>

          <p>
            <strong>
              Lifetime:
            </strong>{" "}
            2 minutes
          </p>

          <p className="mt-3 break-all text-sm">
            <strong>JTI:</strong>{" "}
            {String(
              decoded?.payload.jti ??
                "N/A"
            )}
          </p>
        </section>

        <section className="rounded-2xl border p-6">
          <h2 className="mb-4 text-2xl font-semibold">
            Refresh Token
          </h2>

          <p>
            <strong>Status:</strong>{" "}
            Present
          </p>

          <p>
            <strong>
              Expires in:
            </strong>{" "}
            {formatRemaining(
              refreshTokenExpiresAt,
              now
            )}
          </p>

          <p>
            <strong>
              Lifetime:
            </strong>{" "}
            7 days
          </p>
        </section>

        <section className="rounded-2xl border p-6">
          <h2 className="mb-4 text-2xl font-semibold">
            Token Rotation
          </h2>

          <p className="mb-4">
            <strong>
              Last refresh:
            </strong>{" "}
            {lastRefreshAt
              ? new Date(
                  lastRefreshAt
                ).toLocaleTimeString()
              : "Not refreshed yet"}
          </p>

          <button
            onClick={() =>
              void refreshToken()
            }
            className="rounded-full bg-black px-6 py-3 text-white"
          >
            Rotate Token
          </button>
        </section>

        <section className="rounded-2xl border p-6">
          <h2 className="mb-4 text-2xl font-semibold">
            JWT
          </h2>

          <p>
            <strong>
              Algorithm:
            </strong>{" "}
            {String(
              decoded?.header.alg ??
                "N/A"
            )}
          </p>

          <p>
            <strong>
              Token Type:
            </strong>{" "}
            {String(
              decoded?.payload
                .tokenType ?? "N/A"
            )}
          </p>

          <p className="break-all">
            <strong>JTI:</strong>{" "}
            {String(
              decoded?.payload.jti ??
                "N/A"
            )}
          </p>
        </section>

      </div>

      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Bearer Extractor Demo
        </h2>

        <button
          onClick={() =>
            void callProtectedMe()
          }
          className="rounded-full bg-black px-6 py-3 text-white"
        >
          Call /api/auth/me
        </button>
      </section>
    </main>
  );
}