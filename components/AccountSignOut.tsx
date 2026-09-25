"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/AuthProvider";

export default function AccountSignOut() {
  const router = useRouter();
  const { logout } = useAuth();

  async function handleSignOut() {
    await logout();

    router.replace("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition hover:bg-gray-50"
    >
      <LogOut className="h-5 w-5" />

      <span>Sign Out</span>
    </button>
  );
}