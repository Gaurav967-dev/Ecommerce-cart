"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useAuth } from "@/components/AuthProvider";

export default function ProfilePage() {
    const { user, loading, authFetch, updateUser } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) {
            return;
        }

        async function loadProfile() {
            const response = await authFetch(
                "/api/profile",
                {
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            setName(data.user.name);
            setEmail(data.user.email);
        }
        
        void loadProfile();
    }, [user, authFetch]);

    if (loading) {
        return (
            <main className="mx-auto max-w-3xl px-6 py-16">
                <p>Loading...</p>
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
                    href="/signin"
                    className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-white"
                >
                    Sign In
                </Link>
            </main>
        );
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setSaving(true);
        setMessage("");

        try {
            const response = await authFetch(
                "/api/profile",
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({ name }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.error ?? "Unable to update profile");

                return;
            }
            
            setName(data.user.name);

            updateUser({
                id: String(data.user.id),
                name: data.user.name,
                email: data.user.email,
            });

            setMessage("Profile updated successfully");
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="mx-auto max-w-3xl px-6 py-16">
            <h1 className="mb-8 text-3xl font-semibold">
                My Profile
            </h1>

            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-2xl border bg-white p-8"
            >
                <div>
                    <label className="mb-2 block font-medium">
                        Name
                    </label>

                    <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="w-full rounded-lg border px-4 py-3"
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block font-medium">
                        Email
                    </label>

                    <input
                        value={email}
                        readOnly
                        className="w-full rounded-lg border bg-gray-100 px-4 py-3"
                    />

                    <p className="mt-1 text-sm text-gray-500">
                        Email cannot be changed here.
                    </p>
                </div>

                {message && (
                    <p className="text-sm">
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-black px-6 py-3 text-white disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </main>
    );
}