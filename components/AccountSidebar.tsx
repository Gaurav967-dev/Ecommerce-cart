"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  LogOut,
  MapPin,
  Package,
  User,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/components/AuthProvider";

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, logout } = useAuth();

  const [signingOut, setSigningOut] =
    useState(false);

  if (!user) {
    return null;
  }

  function active(path: string) {
    if (path === "/orders") {
      return pathname.startsWith("/orders");
    }

    return pathname === path;
  }

  async function handleSignOut() {
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

  const navItems = [
    {
      href: "/profile",
      label: "Profile",
      icon: User,
    },
    {
      href: "/orders",
      label: "Orders",
      icon: Package,
    },
    {
      href: "/wishlist",
      label: "Wishlist",
      icon: Heart,
    },
  ];

  return (
    <aside className="rounded-3xl border bg-white p-5 shadow-sm lg:sticky lg:top-28">
      {/* USER */}

      <div className="border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
            <User className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold">
              {user.name}
            </p>

            <p className="truncate text-sm text-gray-500">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}

      <nav className="mt-5 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active(item.href)
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-black"
              }`}
            >
              <Icon className="h-5 w-5" />

              {item.label}
            </Link>
          );
        })}

        <Link
          href="/profile#addresses"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-black"
        >
          <MapPin className="h-5 w-5" />

          Addresses
        </Link>
      </nav>

      {/* SIGN OUT */}

      <div className="mt-5 border-t pt-5">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />

          {signingOut
            ? "Signing out..."
            : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}