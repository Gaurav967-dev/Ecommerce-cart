"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { CalendarDaysIcon, CheckIcon, HomeIcon, AtSignIcon, MapPinIcon, PhoneCallIcon, PlusIcon, UserIcon, XIcon } from "lucide-animated";

import { useAuth } from "@/components/AuthProvider";

import AccountShell from "@/components/AccountShell";

export default function ProfilePage() {
  const { user, loading, authFetch, updateUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [createdAt, setCreatedAt] = useState("");

  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);

      return;
    }


    async function loadProfile() {
      try {
        setProfileError("");

        const response = await authFetch(
          "/api/profile",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setProfileError(data.error ?? "Unable to load profile");

          return;
        }

        setName(data.user.name ?? "");
        setEmail(data.user.email ?? "");
        setPhone(data.user.phone ?? "");
        setCreatedAt(data.user.createdAt ?? "");

      } catch (error) {
        console.error("Profile load error:", error);

        setProfileError("Something went wrong while loading your profile.");

      } finally {
        setProfileLoading(false);
      }
    }


    void loadProfile();

  }, [user, authFetch]);


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
          You need to be logged in to view your profile.
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
        await authFetch("/api/profile",
          {
            method: "PATCH",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              name,
              phone,
            }),
          }
        );


      const data = await response.json();


      if (!response.ok) {
        setProfileError(data.error ?? "Unable to update profile");

        return;
      }


      setName(data.user.name);
      setPhone(data.user.phone ?? "");

      updateUser({
        id: String(data.user.id),
        name: data.user.name,
        email: data.user.email,
      });

      setProfileMessage("Profile updated successfully.");

    } catch (error) {
      console.error("Profile update error:", error);

      setProfileError("Something went wrong while updating your profile.");

    } finally {
      setSaving(false);
    }
  }

  return (
    <AccountShell>

      {/* PAGE HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage your personal information and account details.
        </p>
      </div>


      {/* PERSONAL INFORMATION */}

      <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">

        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-gray-100 p-3">
            <UserIcon className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              Personal Information
            </h2>

            <p className="text-sm text-gray-500">
              Update your personal details.
            </p>
          </div>
        </div>


        {profileLoading ? (
          <p className="text-sm text-gray-500">
            Loading personal information...
          </p>
        ) : (
          <form
            onSubmit={handleProfileSubmit}
            className="space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">

              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full Name
                </label>

                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={100}
                    className="w-full rounded-xl border px-4 py-3 pl-12 outline-none transition focus:border-black"
                  />
                </div>
              </div>


              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email Address
                </label>

                <div className="relative">
                  <AtSignIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    value={email}
                    readOnly
                    className="w-full rounded-xl border bg-gray-50 px-4 py-3 pl-12 text-gray-600"
                  />
                </div>

                <p className="mt-1 text-xs text-gray-400">
                  Email cannot be changed here.
                </p>
              </div>


              {/* PHONE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Phone Number
                </label>

                <div className="relative">
                  <PhoneCallIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value
                      )
                    }
                    maxLength={20}
                    placeholder="+91 9876543210"
                    className="w-full rounded-xl border px-4 py-3 pl-12 outline-none transition focus:border-black"
                  />
                </div>
              </div>


              {/* MEMBER SINCE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Member Since
                </label>

                <div className="flex min-h-[50px] items-center gap-3 rounded-xl border bg-gray-50 px-4">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400" />

                  <span className="text-sm font-medium">
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
                  </span>
                </div>
              </div>

            </div>


            {profileError && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {profileError}
              </p>
            )}


            {profileMessage && (
              <p className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckIcon className="h-4 w-4" />

                {profileMessage}
              </p>
            )}


            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

      </section>
    </AccountShell>
  );
}