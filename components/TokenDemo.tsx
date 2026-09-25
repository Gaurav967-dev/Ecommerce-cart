"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/components/AuthProvider";

function formatTime(milliseconds: number | null) {
  if (!milliseconds) {
    return "--";
  }

  const seconds = Math.max(
    0,
    Math.floor(
      (milliseconds - Date.now()) / 1000
    )
  );

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(
    (seconds % 86400) / 3600
  );
  const minutes = Math.floor(
    (seconds % 3600) / 60
  );
  const remainingSeconds = seconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds
    .toString()
    .padStart(2, "0")}s`;
}

export default function TokenDemo() {
  const {
    user,
    loading,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
    lastRefreshAt,
    jwt,
    refreshToken,
  } = useAuth();

  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((value) => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-semibold">
          JWT Token Demo
        </h1>

        <p className="text-gray-500">
          Please sign in first.
        </p>

        <Link
          href="/signin"
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
        >
          Sign In
        </Link>
      </main>
    );
  }

  const accessExpired =
    !accessTokenExpiresAt ||
    accessTokenExpiresAt <= Date.now();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">
          JWT Token Demo
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Email/password authentication with
          access and refresh JWTs.
        </p>

        {/* User */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            User
          </h2>

          <div className="mt-4 space-y-2 text-sm">
            <p>
              <strong>Name:</strong>{" "}
              {user.name}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {user.email}
            </p>
          </div>
        </section>

        {/* Token cards */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">

          {/* Access Token */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              Access Token
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <p>
                <strong>Status:</strong>{" "}
                {accessExpired
                  ? "Expired"
                  : "Valid"}
              </p>

              <p>
                <strong>Expires in:</strong>{" "}
                {formatTime(
                  accessTokenExpiresAt
                )}
              </p>

              <p>
                <strong>Lifetime:</strong>{" "}
                60 seconds
              </p>
            </div>
          </section>

          {/* Refresh Token */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              Refresh Token
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <p>
                <strong>Status:</strong>{" "}
                {refreshTokenExpiresAt
                  ? "Present"
                  : "Missing"}
              </p>

              <p>
                <strong>Expires in:</strong>{" "}
                {formatTime(
                  refreshTokenExpiresAt
                )}
              </p>

              <p>
                <strong>Lifetime:</strong>{" "}
                7 days
              </p>
            </div>
          </section>

          {/* Rotation */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              Refresh Token Rotation
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <p>
                <strong>Last refresh:</strong>{" "}
                {lastRefreshAt
                  ? new Date(
                      lastRefreshAt
                    ).toLocaleTimeString()
                  : "Not refreshed yet"}
              </p>

              <button
                type="button"
                onClick={() => {
                  void refreshToken();
                }}
                className="rounded-xl bg-black px-4 py-2 text-white"
              >
                Rotate Refresh Token
              </button>
            </div>
          </section>

          {/* JWT information */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              JWT
            </h2>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Signature:</strong>{" "}
                {jwt?.hasSignature
                  ? "Present"
                  : "Not available"}
              </p>

              <p>
                <strong>Token Type:</strong>{" "}
                {String(
                  jwt?.payload?.tokenType ??
                    "Unknown"
                )}
              </p>

              <p>
                <strong>JTI:</strong>{" "}
                {String(
                  jwt?.payload?.jti ??
                    "Not available"
                )}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}