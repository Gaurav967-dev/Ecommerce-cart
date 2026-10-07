"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AtSignIcon, LockIcon, ArrowRightIcon } from "lucide-animated";

import { useAuth } from "@/components/AuthProvider";

export default function SignInPage() {
  const router = useRouter();
  const { login, refreshToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [refreshingSession, setRefreshingSession] = useState(false);

  function getDestination() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const callbackUrl =
      params.get("callbackUrl");

    return (
      callbackUrl &&
      callbackUrl.startsWith("/") &&
      !callbackUrl.startsWith("//")
        ? callbackUrl
        : "/account"
    );
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const result = await login(email, password);

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Unable to sign in");

      return;
    }

    router.replace(
      getDestination()
    );

    const params = new URLSearchParams(window.location.search);

    const callbackUrl = params.get("callbackUrl");

    const destination =
      callbackUrl &&
      callbackUrl.startsWith("/") &&
      !callbackUrl.startsWith("//")
        ? callbackUrl
        : "/account";

    router.replace(destination);
  }

  async function handleContinueSession() {
    setRefreshingSession(true);
    setError("");

    const success =
      await refreshToken();

    setRefreshingSession(false);

    if (!success) {
      setError(
        "Your session has expired. Please sign in again."
      );

      return;
    }

    router.replace(
      getDestination()
    );
  }

  return (
    <main className="min-h-[calc(100vh-105px)] bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">
          Sign In
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Sign in with your email and password.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">
                <AtSignIcon size={20} />
              </div>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-black"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">
                <LockIcon size={20} />
              </div>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-black"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}

            {!loading && (
              <ArrowRightIcon size={20} />
            )}
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
                    
            <span className="text-xs uppercase tracking-wide text-gray-400">
              or
            </span>
                    
            <div className="h-px flex-1 bg-gray-200" />
          </div>
                    
          <button
            type="button"
            onClick={() =>
              void handleContinueSession()
            }
            disabled={
              loading ||
              refreshingSession
            }
            className="w-full rounded-xl border py-3 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50"
          >
            {refreshingSession
              ? "Refreshing Session..."
              : "Continue Existing Session"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-black"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}