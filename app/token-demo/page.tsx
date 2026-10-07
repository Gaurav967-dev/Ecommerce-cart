"use client";

import { useEffect, useMemo, useState } from "react";

import { decodeJwt, decodeProtectedHeader } from "jose";

import { useAuth } from "@/components/AuthProvider";

const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ??
  "http://localhost:8000";

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

  const [meStatus, setMeStatus] =
    useState<number | null>(null);

  const [rotationMessage, setRotationMessage] =
    useState("");

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

  const accessTokenExpired =
    Boolean(
      accessToken &&
      accessTokenExpiresAt &&
      now >= accessTokenExpiresAt
    );

  async function callPythonAuthMe() {
    try {
      setMeStatus(null);

      const response =
        await authFetch(
          `${AUTH_API_URL}/auth/me`,
          {
            method: "GET",
          
            credentials:
              "include",
          
            cache:
              "no-store",
          }
        );

      const data = await response.json();

      setMeStatus(
        response.status
      );

      setMeResponse(data);

      console.log(
        "Python /auth/me:",
        response.status,
        data
      );
    } catch (error) {
      console.error(
        "Python auth/me failed:",
        error
      );

      setMeStatus(null);

      setMeResponse({
        error:
          "Unable to call Python /auth/me",
      });
    }
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

  async function handleManualRotation() {
    setRotationMessage(
      "Requesting new tokens..."
    );

    const success =
      await refreshToken();

    if (success) {
      setRotationMessage(
        "New access and refresh tokens issued."
      );

      setMeResponse(null);
      setMeStatus(null);

      return;
    }

    setRotationMessage(
      "Token rotation failed."
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
            <span
              className={
                !accessToken
                  ? "font-semibold text-gray-500"
                  : accessTokenExpired
                    ? "font-semibold text-red-600"
                    : "font-semibold text-green-600"
              }
            >
              {!accessToken
                ? "Missing"
                : accessTokenExpired
                  ? "Expired"
                  : "Valid"}
            </span>
          </p>

          <p>
            <strong>Expires in:</strong>{" "}
            <span
              className={
                accessTokenExpired
                  ? "font-semibold text-red-600"
                  : ""
              }
            >
              {accessTokenExpired
                ? "Expired"
                : formatRemaining(
                    accessTokenExpiresAt,
                    now
                  )}
            </span>
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
            type="button"
            onClick={() =>
              void handleManualRotation()
            }
            className="rounded-full bg-black px-6 py-3 text-white"
          >
            Rotate Token
          </button>

          {rotationMessage && (
            <p className="mt-3 text-sm text-gray-500">
              {rotationMessage}
            </p>
          )}
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
        <h2 className="mb-2 text-xl font-semibold">
          Python Bearer Authorization Demo
        </h2>

        <p className="mb-4 text-sm text-gray-500">
          Sends the current access token to the
          Python FastAPI /auth/me endpoint using
          the Authorization Bearer header.
        </p>

        <button
          type="button"
          onClick={() =>
            void callPythonAuthMe()
          }
          className="rounded-full bg-black px-6 py-3 text-white"
        >
          Call Python /auth/me
        </button>

        {meResponse !== null && (
          <div className="mt-6">
            <h3 className="mb-3 font-semibold">
              Python API Response
            </h3>

            {meStatus && (
              <div
                className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${
                  meStatus >= 200 &&
                  meStatus < 300
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-green-700"
                }`}
              >
                HTTP {meStatus}{" "}

                {meStatus === 200
                  ? "Authorized"
                  : meStatus === 401
                    ? "Unauthorized"
                    : "Request failed"}
              </div>
            )}

            <pre className="max-h-[500px] overflow-auto rounded-xl bg-gray-950 p-5 text-sm text-green-400">
              {JSON.stringify(
                meResponse,
                null,
                2
              )}
            </pre>
          </div>
        )}
      </section>
    </main>
  );
}