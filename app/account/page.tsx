"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  User,
  Mail,
  ShoppingBag,
} from "lucide-react";

import AccountSignOut from "@/components/AccountSignOut";
import { useAuth } from "@/components/AuthProvider";

export default function AccountPage() {
  const router = useRouter();

  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-[calc(100vh-105px)] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading account...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-105px)] bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">
            My Account
          </h1>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">
                  Name
                </p>
                <p className="font-medium">
                  {user.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">
                  Email
                </p>
                <p className="font-medium">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white"
            >
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Link>

            <Link
              href="/token-demo"
              className="rounded-xl border px-4 py-3 text-center text-sm font-medium"
            >
              JWT Token Demo
            </Link>
          </div>

          <div className="mt-6">
            <AccountSignOut />
          </div>
        </div>
      </div>
    </main>
  );
}