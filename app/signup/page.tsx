"use client";

import Link from "next/link";
import { useActionState } from "react";
import { User, Mail, Lock, ArrowRight } from "lucide-react";

import { registerUser } from "@/app/actions/auth";

export default function SignUpPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    registerUser,
    undefined
  );

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

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
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
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
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
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimum 6 characters"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Creating Account..." : "Create Account"}

              {!isPending && <ArrowRight className="h-5 w-5" />}
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