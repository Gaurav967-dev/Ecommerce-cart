"use client";

import Link from "next/link";

import AccountShell from "@/components/AccountShell";
// import AddressBook from "@/components/AddressBook";
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
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Saved Addresses
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage your delivery addresses for
          faster checkout.
        </p>
      </div>

      {/* <AddressBook /> */}
    </AccountShell>
  );
}