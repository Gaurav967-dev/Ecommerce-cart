"use client";

import type { ReactNode } from "react";

import AccountSidebar from "@/components/AccountSidebar";
import { useAuth } from "@/components/AuthProvider";

export default function AccountShell({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div
          className={
            user
              ? "grid gap-8 lg:grid-cols-[260px_1fr]"
              : ""
          }
        >
          {user && (
            <AccountSidebar />
          )}

          <div className="min-w-0">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}