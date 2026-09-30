"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

type Order = {
    id: string | number;
    order_number: string | null;
    total_amount: number | string;
    subtotal: number | string;
    discount_amount: number | string;
    shipping_fee: number | string;
    tax_amount: number | string;
    status: string;
    payment_method: string | null;
    payment_status: string;
    item_count: number;
    created_at: string;
};

export default function OrdersPage() {
    const { user, loading, authFetch } = useAuth();

    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState("");

    useEffect(() => {
        if (!user) {
            setOrdersLoading(false);
            return;
        }

        async function loadOrders() {
            setOrdersError("");

            try {
                const response = await authFetch(
                    "/api/orders",
                    {
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    setOrdersError(data.error ?? "Unable to load orders");

                    return;
                }

                setOrders(data.orders ?? []);
            } catch (error) {
                console.error("Failed to load orders:", error);

                setOrdersError("Something went wrong while loading your orders.");
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
                    href="/signin?callbackUrl=/orders"
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
            ) : ordersError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                    <p className="text-sm text-red-600">
                        {ordersError}
                    </p>
                </div>
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

                                <Link
                                  href={`/orders/${order.id}`}
                                  className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
                                >
                                  View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}