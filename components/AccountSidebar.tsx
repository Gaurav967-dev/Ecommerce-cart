"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { useState } from "react";

import {
  UserIcon,
  BoxIcon,
  HeartIcon,
  MapPinIcon,
  LogoutIcon,
} from "lucide-animated";

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
      icon: UserIcon,
    },
    {
      href: "/orders",
      label: "Orders",
      icon: BoxIcon,
    },
    {
      href: "/wishlist",
      label: "Wishlist",
      icon: HeartIcon,
    },
    {
      href: "/addresses",
      label: "Addresses",
      icon: MapPinIcon,
    },
  ];

  return (
    <aside className="rounded-3xl border bg-white p-5 shadow-sm lg:sticky lg:top-28">
      {/* USER */}

      <div className="border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
            <UserIcon size={21} />
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
          const isActive = active(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-black"
              }`}
            >
              <Icon
                size={20}
                className="shrink-0"
              />

              <span>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* SIGN OUT */}

      <div className="mt-5 border-t pt-5">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          <LogoutIcon size={20} />

          <span>
            {signingOut
              ? "Signing out..."
              : "Sign Out"}
          </span>
        </button>
      </div>
    </aside>
  );
}