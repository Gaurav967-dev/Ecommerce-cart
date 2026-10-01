"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { BoxIcon, ChevronRightIcon } from "lucide-animated";

import AccountShell from "@/components/AccountShell";

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
    <AccountShell>
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          My Orders
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          View and track your previous and current orders.
        </p>
      </div>

      {/* CONTENT */}

      {ordersLoading ? (
        <div className="rounded-3xl border bg-white p-8">
          <p className="text-sm text-gray-500">
            Loading orders...
          </p>
        </div>
      ) : ordersError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">
            {ordersError}
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
          <BoxIcon className="mx-auto h-10 w-10 text-gray-400" />

          <h2 className="mt-4 text-lg font-semibold">
            No orders yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Your orders will appear here after you make a purchase.
          </p>

          <Link
            href="/shop"
            className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <article
              key={order.id}
              className="overflow-hidden rounded-3xl border bg-white shadow-sm"
            >
              {/* TOP */}

              <div className="flex flex-wrap items-start justify-between gap-4 border-b bg-gray-50 px-6 py-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Order
                  </p>

                  <h2 className="mt-1 font-semibold">
                    #
                    {order.order_number ??
                      order.id}
                  </h2>
                </div>

                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Placed On
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {new Date(
                      order.created_at
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              {/* BODY */}

              <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">

                {/* ITEMS */}

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Items
                  </p>

                  <p className="mt-2 font-medium">
                    {order.item_count}{" "}
                    {order.item_count === 1
                      ? "item"
                      : "items"}
                  </p>
                </div>

                {/* ORDER STATUS */}

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Order Status
                  </p>

                  <span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium capitalize">
                    {order.status.replaceAll(
                      "_",
                      " "
                    )}
                  </span>
                </div>

                {/* PAYMENT */}

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Payment
                  </p>

                  <p className="mt-2 font-medium">
                    {order.payment_method ??
                      "N/A"}
                  </p>

                  <p className="mt-1 text-sm capitalize text-gray-500">
                    {order.payment_status ??
                      "pending"}
                  </p>
                </div>

                {/* TOTAL */}

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Order Total
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    {new Intl.NumberFormat(
                      "en-IN",
                      {
                        style:
                          "currency",
                        currency:
                          "INR",
                      }
                    ).format(
                      Number(
                        order.total_amount
                      )
                    )}
                  </p>
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex flex-wrap items-center justify-between gap-4 border-t px-6 py-4">
                <p className="text-sm text-gray-500">
                  Payment status:{" "}
                  <span className="font-medium capitalize text-black">
                    {order.payment_status ??
                      "pending"}
                  </span>
                </p>

                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  View Details
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </AccountShell>
  );
}