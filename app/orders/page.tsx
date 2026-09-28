"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

type Order = {
    id: string | number;
    total_amount: number | string;
    status: string;
    created_at: string;
};

export default function OrdersPage() {
    const { user, loading, authFetch } = useAuth();

    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setOrdersLoading(false);
            return;
        }

        async function loadOrders() {
            try {
                const response = await authFetch(
                    "/api/orders",
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                setOrders(data.orders ?? []);
            } finally {
                setOrdersLoading(false);
            }
        }

        void loadOrders();
    }, [user, authFetch]);

    if (loading) {
        return (
            <main className="mx-auto max-w-5xl px-6 py-16">
                Loading...
            </main>
        );
    }

    if (!user) {
        return (
            <main className="mx-auto max-w-5xl px-6 py-20 text-center">
                <h1 className="text-3xl font-semibold">
                    Please login
                </h1>

                <p className="mt-3 text-gray-600">
                    You need to be logged in to view your orders.
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

    return (
        <main className="mx-auto max-w-5xl px-6 py-16">
            <h1 className="mb-8 text-3xl font-semibold">
                My Orders
            </h1>

            {ordersLoading ? (
                <p>Loading orders...</p>
            ) : orders.length === 0 ? (
                <div className="rounded-2xl border p-8 text-center">
                    <p>You don't have any orders yet.</p>

                    <Link
                        href="/shop"
                        className="mt-4 inline-block rounded-full bg-black px-6 py-3 text-white"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-6"
                        >
                            <div>
                                <p className="font-semibold">
                                    Order #{order.id}
                                </p>

                                <p className="text-sm text-gray-500">
                                    {new Date(
                                        order.created_at
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <p className="font-medium">
                                    Rs. {order.total_amount}
                                </p>

                                <p className="text-sm capitalize text-gray-500">
                                    {order.status}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}