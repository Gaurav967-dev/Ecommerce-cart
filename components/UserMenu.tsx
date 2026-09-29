"use client";

import Link from "next/link";

import { useRouter } from "next/navigation";
import { User, ChevronDown, Package, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function UserMenu() {
    const { user, logout } = useAuth();

    const router = useRouter();

    if (!user) return null;

    async function handleLogout() {
        await logout();

        router.replace("/");
        router.refresh();
    }

    return (
        <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-muted">
                <User className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"/>

                <span>Hi, {user.name || "User"}</span>

                <ChevronDown className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" />
            </summary>

            <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border bg-white shadow-lg">
                <Link
                    href="/profile"
                    className="group/item flex items-center gap-3 px-4 py-3 transition hover:bg-muted"
                >
                    <User className="h-5 w-5 transition-transform duration-300 group-hover/item:scale-110" />

                    <span>Profile</span>
                </Link>

                <Link
                    href="/orders"
                    className="group/item flex items-center gap-3 px-4 py-3 transition hover:bg-muted"
                >
                    <Package className="h-5 w-5 transition-transform duration-300 group-hover/item:scale-110" />

                    <span>Orders</span>
                </Link>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="group/item flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted"
                >
                    <LogOut className="h-5 w-5 transition-transform duration-300 group-hover/item:translate-x-1" />

                    <span>Sign Out</span>
                </button>
            </div>
        </details>
    );
}