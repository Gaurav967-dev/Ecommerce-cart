"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  Clock3,
  KeyRound,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

export default function TokenDemo() {
  const { data: session, status } = useSession();

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!session?.expires) {
      setRemainingSeconds(null);
      return;
    }

    const updateTimer = () => {
      const expiry = new Date(session.expires).getTime();
      const remaining = Math.max(
        0,
        Math.floor((expiry - Date.now()) / 1000)
      );

      setRemainingSeconds(remaining);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session?.expires]);

  if (status === "loading") {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border bg-card p-8">
            Loading session...
          </div>
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border bg-card p-8 text-center">
            <h1 className="text-2xl font-bold">
              Token Demo
            </h1>

            <p className="mt-3 text-muted-foreground">
              Please sign in to view your Auth.js session information.
            </p>

            <Link
              href="/signin"
              className="mt-6 inline-flex rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${minutes
      .toString()
      .padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">
            Auth.js Learning Demo
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Token & Session Demo
          </h1>

          <p className="mt-3 max-w-3xl text-muted-foreground">
            This page demonstrates how your current Auth.js Credentials
            authentication uses a JWT session and how session expiry differs
            from OAuth refresh-token rotation.
          </p>
        </div>

        {/* Current Session */}
        <section className="mb-6 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6" />

            <div>
              <h2 className="text-xl font-semibold">
                Current Auth.js Session
              </h2>

              <p className="text-sm text-muted-foreground">
                Real session information from your application
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">
                User
              </p>

              <p className="mt-1 font-semibold">
                {session.user.name || "User"}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">
                Email
              </p>

              <p className="mt-1 font-semibold">
                {session.user.email || "No email"}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">
                Session Strategy
              </p>

              <p className="mt-1 font-semibold">
                JWT
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">
                Session Expires
              </p>

              <p className="mt-1 font-semibold">
                {new Date(session.expires).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="mt-6 rounded-xl border bg-muted/40 p-5">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5" />

              <div>
                <p className="text-sm text-muted-foreground">
                  Remaining Session Time
                </p>

                <p className="mt-1 text-3xl font-bold tabular-nums">
                  {remainingSeconds !== null
                    ? formatTime(remainingSeconds)
                    : "--:--"}
                </p>
              </div>
            </div>

            {remainingSeconds === 0 && (
              <p className="mt-4 text-sm font-medium">
                Session has expired. Sign in again.
              </p>
            )}
          </div>
        </section>

        {/* Token Flow */}
        <section className="mb-6 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <KeyRound className="h-6 w-6" />

            <div>
              <h2 className="text-xl font-semibold">
                Your Current Token Flow
              </h2>

              <p className="text-sm text-muted-foreground">
                This is the flow actually used by your project
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="flex items-center gap-3">
                <FlowBox text="Email + Password" />
                <Arrow />
                <FlowBox text="Credentials Provider" />
                <Arrow />
                <FlowBox text="PostgreSQL + bcrypt" />
                <Arrow />
                <FlowBox text="Auth.js JWT Session" />
                <Arrow />
                <FlowBox text="HttpOnly Cookie" />
              </div>
            </div>
          </div>
        </section>

        {/* Token Comparison */}
        <section className="mb-6 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Token Concepts
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <TokenCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Session JWT"
              description="Your current project uses an Auth.js JWT session stored in an encrypted HttpOnly cookie."
              active
            />

            <TokenCard
              icon={<KeyRound className="h-5 w-5" />}
              title="Access Token"
              description="Usually a short-lived token used to authorize requests to a protected API. Your current Credentials setup does not issue one."
            />

            <TokenCard
              icon={<RefreshCw className="h-5 w-5" />}
              title="Refresh Token"
              description="Used in OAuth flows to obtain a new access token without requiring the user to sign in again. Your current Credentials setup does not issue one."
            />
          </div>
        </section>

        {/* Rotation */}
        <section className="mb-6 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6" />

            <div>
              <h2 className="text-xl font-semibold">
                Refresh Token Rotation
              </h2>

              <p className="text-sm text-muted-foreground">
                OAuth concept — not currently used by your Credentials login
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border p-5">
            <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
              <Step text="Access Token" />
              <Arrow />
              <Step text="Expires" />
              <Arrow />
              <Step text="Refresh Token" />
              <Arrow />
              <Step text="New Access Token" />
            </div>

            <div className="mt-5 text-center text-sm text-muted-foreground">
              Some OAuth providers also return a new refresh token during
              this process. Auth.js currently documents implementing this
              logic through the JWT/session callbacks rather than providing
              automatic refresh-token rotation.
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6" />

            <h2 className="text-xl font-semibold">
              Security Notes
            </h2>
          </div>

          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            <p>
              • Auth.js stores the JWT session in an HttpOnly cookie.
            </p>

            <p>
              • Browser JavaScript cannot read that HttpOnly cookie through
              document.cookie.
            </p>

            <p>
              • Never display the actual JWT, password, access token, or
              refresh token on a public page.
            </p>

            <p>
              • This demo intentionally shows session metadata instead of
              exposing sensitive authentication values.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function FlowBox({ text }: { text: string }) {
  return (
    <div className="rounded-xl border bg-muted/40 px-4 py-3 text-center text-sm font-medium">
      {text}
    </div>
  );
}

function Arrow() {
  return (
    <span className="text-xl text-muted-foreground">
      →
    </span>
  );
}

function Step({ text }: { text: string }) {
  return (
    <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm font-medium">
      {text}
    </div>
  );
}

function TokenCard({
  icon,
  title,
  description,
  active = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        active ? "bg-muted/40" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}

        <h3 className="font-semibold">
          {title}
        </h3>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}