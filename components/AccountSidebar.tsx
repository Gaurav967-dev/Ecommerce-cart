"use client";

import Link from "next/link";

import {
  Heart,
  MapPin,
  Package,
  User,
} from "lucide-react";

import { usePathname } from "next/navigation";

import { useAuth } from "@/components/AuthProvider";
import AccountSignOut from "@/components/AccountSignOut";

export default function AccountSidebar() {
  const pathname = usePathname();

  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const profileActive =
    pathname === "/profile";

  const ordersActive =
    pathname === "/orders" ||
    pathname.startsWith("/orders/");

  return (
    <aside className="h-fit rounded-3xl border bg-white p-5 shadow-sm lg:sticky lg:top-28">

      {/* USER */}

      <div className="border-b pb-5">
        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white">
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

      <nav className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">

        <Link
          href="/profile"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
            profileActive
              ? "bg-black text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-black"
          }`}
        >
          <User className="h-5 w-5" />

          <span>
            Profile
          </span>
        </Link>


        <Link
          href="/orders"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
            ordersActive
              ? "bg-black text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-black"
          }`}
        >
          <Package className="h-5 w-5" />

          <span>
            Orders
          </span>
        </Link>


        <Link
          href="/wishlist"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-black"
        >
          <Heart className="h-5 w-5" />

          <span>
            Wishlist
          </span>
        </Link>


        <Link
          href="/profile#addresses"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-black"
        >
          <MapPin className="h-5 w-5" />

          <span>
            Addresses
          </span>
        </Link>

      </nav>


      {/* SIGN OUT */}

      <div className="mt-5 border-t pt-5">
        <AccountSignOut />
      </div>

    </aside>
  );
}