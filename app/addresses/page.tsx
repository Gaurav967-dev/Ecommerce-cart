"use client";

import Link from "next/link";

import AccountShell from "@/components/AccountShell";
import AddressBook from "@/components/AddressBook";
import { useAuth } from "@/components/AuthProvider";

export default function AddressesPage() {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <main className="p-10">
        Loading addresses...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold">
          Please login
        </h1>

        <p className="mt-3 text-gray-500">
          Sign in to manage your saved addresses.
        </p>

        <Link
          href="/signin?callbackUrl=/addresses"
          className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-white"
        >
          Sign In
        </Link>
      </main>
    );
  }

  return (
    <AccountShell>

      {/* ADDRESS HERO */}

      <section className="mb-6 overflow-hidden rounded-3xl bg-black px-6 py-8 text-white shadow-sm sm:px-8">

        <div className="flex flex-wrap items-end justify-between gap-5">

          <div>
            <p className="text-sm font-medium text-white/60">
              Account settings
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Delivery Addresses
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
              Save your frequently used
              delivery locations for a
              faster checkout experience.
            </p>
          </div>

        </div>
      </section>

      <AddressBook />

    </AccountShell>
  );
}