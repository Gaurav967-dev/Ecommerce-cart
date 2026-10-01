"use client";

import {
  useEffect,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  BoxIcon,
  CartIcon,
  ChevronRightIcon,
  HeartIcon,
  LayoutGridIcon,
  MapPinIcon,
  UserIcon,
} from "lucide-animated";

import AccountShell from "@/components/AccountShell";
import { useAuth } from "@/components/AuthProvider";

export default function AccountPage() {
  const router = useRouter();

  const {
    user,
    loading,
  } = useAuth();

  useEffect(() => {
    if (
      !loading &&
      !user
    ) {
      router.replace(
        "/signin?callbackUrl=/account"
      );
    }
  }, [
    loading,
    user,
    router,
  ]);

  if (
    loading ||
    !user
  ) {
    return (
      <main className="flex min-h-[calc(100vh-105px)] items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Loading account...
        </p>
      </main>
    );
  }

  const initial =
    user.name
      ?.trim()
      .charAt(0)
      .toUpperCase() ||
    "U";

  return (
    <AccountShell>

      {/* ACCOUNT HERO */}

      <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">

        <div className="bg-black px-6 py-8 text-white sm:px-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-5">

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/20 bg-white text-3xl font-bold text-black">
                {initial}
              </div>

              <div>
                <p className="text-sm text-white/60">
                  Welcome back
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  {user.name ||
                    "My Account"}
                </h1>

                <p className="mt-1 text-sm text-white/60">
                  {user.email}
                </p>
              </div>

            </div>

            <Link
              href="/profile"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-100"
            >
              <UserIcon
                size={18}
              />

              Edit Profile
            </Link>

          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-5 sm:px-8">

          <LayoutGridIcon
            size={21}
            className="text-gray-500"
          />

          <div>
            <p className="font-semibold">
              Account Overview
            </p>

            <p className="text-sm text-gray-500">
              Manage your profile,
              purchases and saved information.
            </p>
          </div>

        </div>

      </section>


      {/* ACCOUNT SECTIONS */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">

        <AccountCard
          href="/profile"
          icon={
            <UserIcon size={24} />
          }
          title="My Profile"
          description="View and update your personal and contact information."
        />

        <AccountCard
          href="/orders"
          icon={
            <BoxIcon size={24} />
          }
          title="My Orders"
          description="Track current deliveries and review previous purchases."
        />

        <AccountCard
          href="/wishlist"
          icon={
            <HeartIcon size={24} />
          }
          title="Wishlist"
          description="View products you have saved for later."
        />

        <AccountCard
          href="/addresses"
          icon={
            <MapPinIcon size={24} />
          }
          title="Delivery Addresses"
          description="Manage saved delivery locations and your default address."
        />

      </div>


      {/* SHOP CTA */}

      <section className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>
            <h2 className="text-lg font-semibold">
              Ready to continue shopping?
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Browse products and add your
              favorites to the cart.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <CartIcon
              size={18}
            />

            Continue Shopping
          </Link>

        </div>

      </section>


      {/* DEVELOPMENT DEMO */}

      <section className="mt-6 rounded-3xl border border-dashed bg-white p-5">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Development Demo
            </p>

            <p className="mt-1 text-sm font-medium">
              JWT & Bearer Authorization
            </p>
          </div>

          <Link
            href="/token-demo"
            className="rounded-full border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            Open Token Demo
          </Link>

        </div>

      </section>

    </AccountShell>
  );
}


function AccountCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >

      <div className="flex items-start justify-between gap-4">

        <div className="rounded-2xl bg-gray-100 p-3">
          {icon}
        </div>

        <ChevronRightIcon
          size={20}
          className="text-gray-400"
        />

      </div>

      <h2 className="mt-5 text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {description}
      </p>

    </Link>
  );
}