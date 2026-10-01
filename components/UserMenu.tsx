"use client";

import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserIcon, ChevronDownIcon, BoxIcon, LogoutIcon } from "lucide-animated";
import { useAuth } from "@/components/AuthProvider";

export default function UserMenu() {
    const { user, logout } = useAuth();
    const [signingOut, setSigningOut] = useState(false);

    const router = useRouter();

    if (!user) return null;

    async function handleLogout() {
        if (signingOut) {
            return;
        }

        setSigningOut(true);

        try {
            await logout();

            router.replace("/");
            router.refresh();
        } finally {
            setSigningOut(false);
        }
    }

    return (
        <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-muted">
                <UserIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"/>

                <span>Hi, {user.name || "User"}</span>

                <ChevronDownIcon className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" />
            </summary>

            <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border bg-white shadow-lg">
                <Link
                    href="/profile"
                    className="group/item flex items-center gap-3 px-4 py-3 transition hover:bg-muted"
                >
                    <UserIcon className="h-5 w-5 transition-transform duration-300 group-hover/item:scale-110" />

                    <span>Profile</span>
                </Link>

                <Link
                    href="/orders"
                    className="group/item flex items-center gap-3 px-4 py-3 transition hover:bg-muted"
                >
                    <BoxIcon className="h-5 w-5 transition-transform duration-300 group-hover/item:scale-110" />

                    <span>Orders</span>
                </Link>

                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={signingOut}
                    className="group/item flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <LogoutIcon className="h-5 w-5 transition-transform duration-300 group-hover/item:translate-x-1" />

                    <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
                </button>
            </div>
        </details>
    );
}