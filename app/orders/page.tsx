"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  BoxIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronRightIcon,
  CreditCardIcon,
  SearchIcon,
  TruckIcon,
} from "lucide-animated";

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

type OrderFilter =
  | "all"
  | "active"
  | "delivered"
  | "cancelled";


function money(
  value: number | string
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
    }
  ).format(
    Number(value)
  );
}


function prettyStatus(
  status: string
) {
  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}


function statusClasses(
  status: string
) {
  switch (
  status.toLowerCase()
  ) {
    case "delivered":
      return "bg-green-50 text-green-700 border-green-200";

    case "cancelled":
      return "bg-red-50 text-red-600 border-red-200";

    case "shipped":
    case "out_for_delivery":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "processing":
    case "confirmed":
      return "bg-amber-50 text-amber-700 border-amber-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export default function OrdersPage() {
  const { user, loading, authFetch } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<OrderFilter>(
    "all"
  );

  const [
    search,
    setSearch,
  ] = useState("");


  const activeOrders =
    orders.filter(
      (order) =>
        ![
          "delivered",
          "cancelled",
        ].includes(
          order.status.toLowerCase()
        )
    );


  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status.toLowerCase() ===
        "delivered"
    );


  const filteredOrders =
    orders.filter(
      (order) => {
        const status =
          order.status.toLowerCase();

        const matchesFilter =
          activeFilter === "all" ||
          (
            activeFilter ===
            "active" &&
            ![
              "delivered",
              "cancelled",
            ].includes(
              status
            )
          ) ||
          (
            activeFilter ===
            "delivered" &&
            status ===
            "delivered"
          ) ||
          (
            activeFilter ===
            "cancelled" &&
            status ===
            "cancelled"
          );

        const query =
          search
            .trim()
            .toLowerCase();

        const matchesSearch =
          !query ||
          String(
            order.id
          )
            .toLowerCase()
            .includes(query) ||
          (
            order.order_number ??
            ""
          )
            .toLowerCase()
            .includes(query);

        return (
          matchesFilter &&
          matchesSearch
        );
      }
    );

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

      <div className="flex flex-wrap items-end justify-between gap-5">

        <div>
          <p className="text-sm font-medium text-gray-400">
            Shopping activity
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            My Orders
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Track deliveries, review purchases
            and view previous orders.
          </p>
        </div>

        <Link
          href="/shop"
          className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white"
        >
          Continue Shopping
        </Link>

      </div>


      {/* SUMMARY */}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">

        <OrderSummary
          label="Total Orders"
          value={orders.length}
          icon={
            <BoxIcon size={22} />
          }
        />

        <OrderSummary
          label="Active Orders"
          value={
            activeOrders.length
          }
          icon={
            <TruckIcon size={22} />
          }
        />

        <OrderSummary
          label="Delivered"
          value={
            deliveredOrders.length
          }
          icon={
            <CheckIcon size={22} />
          }
        />

      </div>


      {/* SEARCH + FILTER */}

      <div className="mt-8 rounded-3xl border bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div className="relative w-full xl:max-w-sm">

            <SearchIcon
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search order number..."
              className="w-full rounded-full border bg-gray-50 py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-black"
            />

          </div>


          <div className="flex flex-wrap gap-2">

            {(
              [
                [
                  "all",
                  "All",
                ],

                [
                  "active",
                  "Active",
                ],

                [
                  "delivered",
                  "Delivered",
                ],

                [
                  "cancelled",
                  "Cancelled",
                ],
              ] as const
            ).map(
              ([
                value,
                label,
              ]) => (

                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      value
                    )
                  }
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeFilter ===
                      value
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {label}
                </button>

              )
            )}

          </div>
        </div>
      </div>


      {/* ORDERS */}

      <div className="mt-6">

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
          <EmptyOrders />
        ) : filteredOrders.length ===
          0 ? (
          <div className="rounded-3xl border border-dashed bg-white p-12 text-center">

            <SearchIcon
              size={38}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-4 text-lg font-semibold">
              No matching orders
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Try a different filter or order
              number.
            </p>

          </div>
        ) : (
          <div className="space-y-5">

            {filteredOrders.map(
              (order) => (

                <article
                  key={order.id}
                  className="overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:shadow-md"
                >

                  {/* CARD HEADER */}

                  <div className="flex flex-wrap items-start justify-between gap-5 border-b bg-gray-50/70 px-6 py-5">

                    <div className="flex items-start gap-4">

                      <div className="rounded-2xl bg-black p-3 text-white">

                        <BoxIcon
                          size={22}
                        />

                      </div>

                      <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Order number
                        </p>

                        <h2 className="mt-1 text-lg font-semibold">
                          #
                          {order.order_number ??
                            order.id}
                        </h2>

                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">

                          <CalendarDaysIcon
                            size={16}
                          />

                          {new Date(
                            order.created_at
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day:
                                "numeric",

                              month:
                                "short",

                              year:
                                "numeric",
                            }
                          )}

                        </div>
                      </div>
                    </div>


                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses(
                        order.status
                      )}`}
                    >
                      {prettyStatus(
                        order.status
                      )}
                    </span>

                  </div>


                  {/* CONTENT */}

                  <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_1fr_1fr]">

                    {/* ITEM SUMMARY */}

                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Order Summary
                      </p>

                      <div className="mt-3 flex items-center gap-3">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">

                          <BoxIcon
                            size={21}
                          />

                        </div>

                        <div>
                          <p className="font-semibold">
                            {
                              order.item_count
                            }{" "}
                            {order.item_count ===
                              1
                              ? "item"
                              : "items"}
                          </p>

                          <p className="text-sm text-gray-500">
                            In this order
                          </p>
                        </div>

                      </div>
                    </div>


                    {/* PAYMENT */}

                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Payment
                      </p>

                      <div className="mt-3 flex items-start gap-3">

                        <CreditCardIcon
                          size={20}
                          className="mt-0.5 text-gray-500"
                        />

                        <div>

                          <p className="font-semibold">
                            {order.payment_method ??
                              "Not available"}
                          </p>

                          <p className="mt-1 text-sm capitalize text-gray-500">
                            {order.payment_status ??
                              "pending"}
                          </p>

                        </div>
                      </div>
                    </div>


                    {/* TOTAL */}

                    <div className="md:text-right">

                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Order Total
                      </p>

                      <p className="mt-2 text-2xl font-semibold">
                        {money(
                          order.total_amount
                        )}
                      </p>

                      {Number(
                        order.discount_amount
                      ) > 0 && (
                          <p className="mt-1 text-sm text-green-600">
                            You saved{" "}
                            {money(
                              order.discount_amount
                            )}
                          </p>
                        )}

                    </div>

                  </div>


                  {/* FOOTER */}

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t px-6 py-4">

                    <div className="text-sm text-gray-500">

                      {order.status ===
                        "delivered"
                        ? "This order has been delivered."
                        : order.status ===
                          "cancelled"
                          ? "This order was cancelled."
                          : "Your order is currently in progress."}

                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                      View Order

                      <ChevronRightIcon
                        size={17}
                      />
                    </Link>

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </div>

    </AccountShell>
  );
}

function OrderSummary({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {value}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-100 p-3">
          {icon}
        </div>

      </div>
    </div>
  );
}


function EmptyOrders() {
  return (
    <div className="rounded-3xl border border-dashed bg-white p-12 text-center">

      <BoxIcon
        size={44}
        className="mx-auto text-gray-400"
      />

      <h2 className="mt-4 text-xl font-semibold">
        No orders yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        When you place an order, its
        delivery status and purchase
        information will appear here.
      </p>

      <Link
        href="/shop"
        className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
      >
        Start Shopping
      </Link>

    </div>
  );
}