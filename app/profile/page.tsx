"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  AtSignIcon,
  BoxIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronRightIcon,
  HeartIcon,
  MapPinIcon,
  PhoneCallIcon,
  SquarePenIcon,
  UserIcon,
  XIcon,
} from "lucide-animated";

import AccountShell from "@/components/AccountShell";
import { useAuth } from "@/components/AuthProvider";

import {
  API_BASE_URL,
} from "@/lib/api";

export default function ProfilePage() {
  const {
    user,
    loading,
    cookieAuthFetch,
    updateUser,
  } = useAuth();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [createdAt, setCreatedAt] =
    useState("");

  const [originalName, setOriginalName] =
    useState("");

  const [originalPhone, setOriginalPhone] =
    useState("");

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [
    profileMessage,
    setProfileMessage,
  ] = useState("");

  const [
    profileError,
    setProfileError,
  ] = useState("");

  const loadedUserRef =
    useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);

      return;
    }

    if (
      loadedUserRef.current === user.id
    ) {
      return;
    }

    loadedUserRef.current =
      user.id;

    async function loadProfile() {
      try {
        setProfileError("");

        const response =
          await cookieAuthFetch(
            `${API_BASE_URL}/profile`,
            {
              credentials: "include",
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setProfileError(
            data.detail ??
              data.error ??
              "Unable to load profile"
          );

          return;
        }

        const loadedName =
          data.user.name ?? "";

        const loadedPhone =
          data.user.phone ?? "";

        setName(loadedName);
        setEmail(
          data.user.email ?? ""
        );

        setPhone(loadedPhone);

        setCreatedAt(
          data.user.createdAt ?? ""
        );

        setOriginalName(
          loadedName
        );

        setOriginalPhone(
          loadedPhone
        );
      } catch (error) {
        console.error(
          "Profile load error:",
          error
        );

        setProfileError(
          "Something went wrong while loading your profile."
        );
      } finally {
        setProfileLoading(false);
      }
    }

    void loadProfile();
  }, [
    user,
    cookieAuthFetch,
  ]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm text-gray-500">
          Loading profile...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">

        <h1 className="text-3xl font-semibold">
          Please login
        </h1>

        <p className="mt-3 text-gray-600">
          You need to be logged in to
          view your profile.
        </p>

        <Link
          href="/signin?callbackUrl=/profile"
          className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-white"
        >
          Sign In
        </Link>
      </main>
    );
  }

  async function handleProfileSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSaving(true);

    setProfileMessage("");
    setProfileError("");

    try {
      const response =
        await cookieAuthFetch(
          `${API_BASE_URL}/profile`,
          {
            method: "PATCH",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name,
              phone,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setProfileError(
          data.detail ??
            data.error ??
            "Unable to update profile"
        );

        return;
      }

      setName(
        data.user.name
      );

      setPhone(
        data.user.phone ?? ""
      );

      setOriginalName(
        data.user.name
      );

      setOriginalPhone(
        data.user.phone ?? ""
      );

      updateUser({
        id:
          String(
            data.user.id
          ),

        name:
          data.user.name,

        email:
          data.user.email,
      });

      setEditing(false);

      setProfileMessage(
        "Profile updated successfully."
      );

    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setProfileError(
        "Something went wrong while updating your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  function cancelEditing() {
    setName(
      originalName
    );

    setPhone(
      originalPhone
    );

    setEditing(false);

    setProfileError("");
    setProfileMessage("");
  }

  const initial =
    name
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "U";

  return (
    <AccountShell>

      {/* PROFILE HERO */}

      <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">

        <div className="bg-black px-6 py-8 text-white sm:px-8">

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

            <div className="flex items-center gap-5">

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/20 bg-white text-3xl font-bold text-black">
                {initial}
              </div>

              <div>
                <p className="text-sm text-white/60">
                  My account
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  {name ||
                    user.name}
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  {email ||
                    user.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setEditing(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-100"
            >
              <SquarePenIcon
                size={18}
              />

              Edit Profile
            </button>
          </div>
        </div>

        {/* ACCOUNT META */}

        <div className="grid gap-px bg-gray-200 sm:grid-cols-3">

          <div className="bg-white px-6 py-5">
            <div className="flex items-center gap-3">

              <CalendarDaysIcon
                size={21}
                className="text-gray-500"
              />

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Member Since
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {createdAt
                    ? new Date(
                      createdAt
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        month:
                          "long",

                        year:
                          "numeric",
                      }
                    )
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white px-6 py-5">

            <div className="flex items-center gap-3">

              <AtSignIcon
                size={21}
                className="text-gray-500"
              />

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Email
                </p>

                <p className="mt-1 truncate text-sm font-semibold">
                  {email}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white px-6 py-5">

            <div className="flex items-center gap-3">

              <PhoneCallIcon
                size={21}
                className="text-gray-500"
              />

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Phone
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {phone ||
                    "Not added"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* QUICK ACCOUNT LINKS */}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">

        <AccountLink
          href="/orders"
          title="My Orders"
          description="Track and review purchases"
          icon={
            <BoxIcon size={23} />
          }
        />

        <AccountLink
          href="/wishlist"
          title="Wishlist"
          description="Products saved for later"
          icon={
            <HeartIcon size={23} />
          }
        />

        <AccountLink
          href="/addresses"
          title="Addresses"
          description="Manage delivery locations"
          icon={
            <MapPinIcon size={23} />
          }
        />

      </div>


      {/* PERSONAL INFORMATION */}

      <section className="mt-6 rounded-3xl border bg-white p-6 shadow-sm sm:p-8">

        <div className="flex flex-wrap items-start justify-between gap-5">

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-gray-100 p-3">

              <UserIcon
                size={24}
              />

            </div>

            <div>
              <h2 className="text-xl font-semibold">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your personal and contact details.
              </p>
            </div>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() =>
                setEditing(true)
              }
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
            >
              <SquarePenIcon
                size={17}
              />

              Edit
            </button>
          )}
        </div>


        {profileLoading ? (
          <p className="mt-8 text-sm text-gray-500">
            Loading personal information...
          </p>
        ) : (
          <form
            onSubmit={
              handleProfileSubmit
            }
            className="mt-8 space-y-6"
          >

            <div className="grid gap-6 md:grid-cols-2">

              {/* NAME */}

              <ProfileField
                label="Full Name"
                icon={
                  <UserIcon
                    size={19}
                  />
                }
              >
                <input
                  value={name}
                  disabled={!editing}
                  required
                  maxLength={100}
                  onChange={(
                    event
                  ) =>
                    setName(
                      event.target
                        .value
                    )
                  }
                  className="w-full bg-transparent outline-none disabled:cursor-default"
                />
              </ProfileField>


              {/* EMAIL */}

              <ProfileField
                label="Email Address"
                icon={
                  <AtSignIcon
                    size={19}
                  />
                }
              >
                <input
                  value={email}
                  disabled
                  className="w-full cursor-default bg-transparent text-gray-500 outline-none"
                />
              </ProfileField>


              {/* PHONE */}

              <ProfileField
                label="Phone Number"
                icon={
                  <PhoneCallIcon
                    size={19}
                  />
                }
              >
                <input
                  type="tel"
                  value={phone}
                  disabled={!editing}
                  maxLength={20}
                  placeholder="Add phone number"
                  onChange={(
                    event
                  ) =>
                    setPhone(
                      event.target
                        .value
                    )
                  }
                  className="w-full bg-transparent outline-none disabled:cursor-default"
                />
              </ProfileField>


              {/* MEMBER */}

              <ProfileField
                label="Member Since"
                icon={
                  <CalendarDaysIcon
                    size={19}
                  />
                }
              >
                <p>
                  {createdAt
                    ? new Date(
                      createdAt
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day:
                          "numeric",

                        month:
                          "long",

                        year:
                          "numeric",
                      }
                    )
                    : "—"}
                </p>
              </ProfileField>

            </div>


            {profileError && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {profileError}
              </p>
            )}


            {profileMessage && (
              <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">

                <CheckIcon size={18} />

                <span>
                  {profileMessage}
                </span>

              </div>
            )}


            {editing && (
              <div className="flex flex-wrap justify-end gap-3 border-t pt-6">

                <button
                  type="button"
                  onClick={
                    cancelEditing
                  }
                  className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition hover:bg-gray-50"
                >
                  <XIcon
                    size={17}
                  />

                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                  <CheckIcon
                    size={17}
                  />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>
            )}

          </form>
        )}

      </section>

    </AccountShell>
  );
}


function AccountLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">

        <div className="rounded-2xl bg-gray-100 p-3">
          {icon}
        </div>

        <ChevronRightIcon
          size={19}
          className="text-gray-400"
        />

      </div>

      <h2 className="mt-5 font-semibold">
        {title}
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>
    </Link>
  );
}


function ProfileField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <div className="flex min-h-[54px] items-center gap-3 rounded-2xl border bg-gray-50 px-4 text-sm font-medium">

        <div className="text-gray-400">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          {children}
        </div>

      </div>
    </div>
  );
}