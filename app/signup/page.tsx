"use client";

import Link from "next/link";

import {
  FormEvent,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  UserIcon,
  AtSignIcon,
  LockIcon,
  ArrowRightIcon,
} from "lucide-animated";

const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ??
  "http://localhost:8000";

export default function SignUpPage() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isPending, setIsPending] =
    useState(false);

  const emailRef =
    useRef<HTMLInputElement>(null);

  const router =
    useRouter();

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setIsPending(true);

    try {
      const response =
        await fetch(
          `${AUTH_API_URL}/auth/signup`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body: JSON.stringify({
              name,
              email,
              password,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        const message =
          data.detail ??
          data.error ??
          "Failed to create account.";

        setErrorMessage(
          message
        );

        if (
          response.status === 409
        ) {
          setEmail("");

          requestAnimationFrame(
            () => {
              emailRef.current
                ?.focus();
            }
          );
        }

        return;
      }

      router.push(
        "/signin?registered=true"
      );
    } catch (error) {
      console.error(
        "Signup failed:",
        error
      );

      setErrorMessage(
        "Unable to reach authentication server."
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-105px)] bg-gray-50 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-185px)] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Create an account to continue shopping.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Full Name
              </label>

              <div className="relative">
                <UserIcon size={20} />

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  required
                  className="w-full rounded-xl border px-10 py-3 outline-none transition focus:border-black"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <div className="relative">
                <AtSignIcon size={20} />

                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  required
                  className="w-full rounded-xl border px-10 py-3 outline-none transition focus:border-black"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <div className="relative">
                <LockIcon size={20} />

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  required
                  minLength={6}
                  className="w-full rounded-xl border px-10 py-3 outline-none transition focus:border-black"
                />
              </div>
            </div>

            {errorMessage && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending
                ? "Creating Account..."
                : "Create Account"}

              {!isPending && (
                <ArrowRightIcon size={20}/>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-black underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}