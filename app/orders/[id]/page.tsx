"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { ArrowLeft, Check, CreditCard, MapPin, Package, Truck } from "lucide-react";

import { useParams } from "next/navigation";

import { useAuth } from "@/components/AuthProvider";

import AccountSidebar from "@/components/AccountSidebar";

type OrderItem = {
  id: string;

  productId:
    string | null;

  productName: string;

  productImage:
    string | null;

  quantity: number;

  unitPrice:
    number | string;
};


type ShippingAddress = {
  name:
    string | null;

  phone:
    string | null;

  addressLine1:
    string | null;

  addressLine2:
    string | null;

  city:
    string | null;

  state:
    string | null;

  postalCode:
    string | null;

  country:
    string | null;
};


type Order = {
  id: string;

  orderNumber:
    string | null;

  subtotal:
    number | string;

  discountAmount:
    number | string;

  shippingFee:
    number | string;

  taxAmount:
    number | string;

  totalAmount:
    number | string;

  status: string;

  paymentMethod:
    string | null;

  paymentStatus:
    string | null;

  createdAt: string;

  updatedAt:
    string | null;

  shippingAddress:
    ShippingAddress;

  items:
    OrderItem[];
};


const orderSteps = [ "pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered" ];


function money(
  value:
    number | string | null | undefined
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",

      currency: "INR",

      maximumFractionDigits: 2,
    }
  ).format(
    Number(value ?? 0)
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


export default function OrderDetailsPage() {
  const params =
    useParams<{
      id: string;
    }>();


  const orderId =
    params.id;


  const {
    user,
    loading,
    authFetch,
  } = useAuth();


  const [
    order,
    setOrder,
  ] =
    useState<Order | null>(
      null
    );


  const [
    orderLoading,
    setOrderLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    if (!user || !orderId) {
      setOrderLoading(false);

      return;
    }


    async function loadOrder() {
      setOrderLoading(true);

      setError("");


      try {
        const response =
          await authFetch(
            `/api/orders/${orderId}`,
            {
              cache: "no-store",
            }
          );


        const data =
          await response.json();


        if (!response.ok) {
          setError(
            data.error ??
              "Unable to load order"
          );

          return;
        }


        setOrder(
          data.order
        );

      } catch (error) {
        console.error(
          "Order fetch error:",
          error
        );


        setError(
          "Something went wrong while loading this order."
        );

      } finally {
        setOrderLoading(false);
      }
    }


    void loadOrder();

  }, [
    user,
    orderId,
    authFetch,
  ]);


  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p>
          Loading...
        </p>
      </main>
    );
  }


  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20 text-center">

        <h1 className="text-3xl font-semibold">
          Please login
        </h1>

        <p className="mt-3 text-gray-500">
          Sign in to view this order.
        </p>

        <Link
          href={`/signin?callbackUrl=${encodeURIComponent(
            `/orders/${orderId}`
          )}`}
          className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-white"
        >
          Sign In
        </Link>

      </main>
    );
  }


  if (orderLoading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm text-gray-500">
          Loading order details...
        </p>
      </main>
    );
  }


  if (error || !order) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20 text-center">

        <Package className="mx-auto h-10 w-10 text-gray-400" />

        <h1 className="mt-4 text-2xl font-semibold">
          Order unavailable
        </h1>

        <p className="mt-2 text-gray-500">
          {error ||
            "Unable to find this order."}
        </p>

        <Link
          href="/orders"
          className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-white"
        >
          Back to Orders
        </Link>

      </main>
    );
  }


  const currentStep =
    orderSteps.indexOf(
      order.status
    );


  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">

        <div className="grid gap-8 lg:grid-cols-[260px-1fr]">

            <AccountSidebar />

            <div>

                {/* BACK */}

                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-black"
                >
                  <ArrowLeft className="h-4 w-4" />

                  Back to Orders
                </Link>


                {/* HEADER */}

                <div className="mt-6 flex flex-wrap items-start justify-between gap-5">

                  <div>
                    <p className="text-sm text-gray-500">
                      Order
                    </p>

                    <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                      #
                      {order.orderNumber ??
                        order.id}
                    </h1>
                    
                    <p className="mt-2 text-sm text-gray-500">
                      Placed on{" "}
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                        
                          month: "long",
                        
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  
                  
                  <span className="rounded-full border bg-white px-4 py-2 text-sm font-medium capitalize shadow-sm">
                    {prettyStatus(
                      order.status
                    )}
                  </span>
                
                </div>
                
                
                {/* ORDER PROGRESS */}
                
                {currentStep >= 0 &&
                  order.status !==
                    "cancelled" && (
                    <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
                    
                      <div className="mb-6 flex items-center gap-3">
                    
                        <div className="rounded-xl bg-gray-100 p-2.5">
                          <Truck className="h-5 w-5" />
                        </div>
                    
                        <div>
                          <h2 className="font-semibold">
                            Order Status
                          </h2>
                    
                          <p className="text-sm text-gray-500">
                            Track your order
                            progress.
                          </p>
                        </div>
                    
                      </div>
                    
                    
                      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    
                        {orderSteps.map(
                          (
                            step,
                            index
                          ) => {
                        
                            const complete =
                              index <=
                              currentStep;
                        
                            return (
                              <div
                                key={step}
                                className={`rounded-xl border p-3 ${
                                  complete
                                    ? "border-black bg-black text-white"
                                    : "bg-gray-50 text-gray-400"
                                }`}
                              >
                            
                                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-current">
                            
                                  {complete ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <span className="text-xs">
                                      {index +
                                        1}
                                    </span>
                                  )}

                                </div>
                              
                                <p className="mt-3 text-xs font-medium">
                                  {prettyStatus(
                                    step
                                  )}
                                </p>
                              
                              </div>
                            );
                          }
                        )}

                      </div>
                    
                    </section>
                  )}

              
                {/* MAIN GRID */}
              
                <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
              
                  {/* LEFT */}
              
                  <div className="space-y-8">
              
                    {/* PRODUCTS */}
              
                    <section className="rounded-3xl border bg-white p-6 shadow-sm">
              
                      <h2 className="text-xl font-semibold">
                        Items
                      </h2>
              
                      <p className="mt-1 text-sm text-gray-500">
                        {order.items.length}{" "}
                        {order.items.length === 1
                          ? "item"
                          : "items"}{" "}
                        in this order
                      </p>
                        
                        
                      <div className="mt-6 divide-y">
                        
                        {order.items.map(
                          (item) => (
                            <div
                              key={item.id}
                              className="flex gap-4 py-5 first:pt-0 last:pb-0"
                            >
                            
                              {/* PRODUCT IMAGE */}
                        
                              {item.productImage ? (
                                <div
                                  className="h-24 w-24 shrink-0 rounded-2xl bg-gray-100 bg-cover bg-center"
                                  style={{
                                    backgroundImage:
                                      `url("${item.productImage}")`,
                                  }}
                                  role="img"
                                  aria-label={
                                    item.productName
                                  }
                                />
                              ) : (
                                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gray-100">
                                  <Package className="h-8 w-8 text-gray-400" />
                                </div>
                              )}

                          
                              <div className="flex flex-1 flex-wrap justify-between gap-4">
                          
                                <div>
                          
                                  <h3 className="font-medium">
                                    {
                                      item.productName
                                    }
                                  </h3>
                                
                                  <p className="mt-2 text-sm text-gray-500">
                                    Quantity:{" "}
                                    {
                                      item.quantity
                                    }
                                  </p>
                                
                                  <p className="mt-1 text-sm text-gray-500">
                                    {money(
                                      item.unitPrice
                                    )}{" "}
                                    each
                                  </p>
                                
                                </div>
                                
                                
                                <p className="font-semibold">
                                  {money(
                                    Number(
                                      item.unitPrice
                                    ) *
                                      item.quantity
                                  )}
                                </p>
                              
                              </div>
                              
                            </div>
                          )
                        )}

                      </div>
                    
                    </section>
                    
                    
                    {/* DELIVERY ADDRESS */}
                    
                    <section className="rounded-3xl border bg-white p-6 shadow-sm">
                    
                      <div className="flex items-center gap-3">
                    
                        <div className="rounded-xl bg-gray-100 p-2.5">
                          <MapPin className="h-5 w-5" />
                        </div>
                    
                        <div>
                          <h2 className="font-semibold">
                            Delivery Address
                          </h2>
                    
                          <p className="text-sm text-gray-500">
                            Shipping destination
                            for this order.
                          </p>
                        </div>
                    
                      </div>
                    
                    
                      <div className="mt-5 text-sm leading-6 text-gray-600">
                    
                        <p className="font-medium text-black">
                          {order
                            .shippingAddress
                            .name ?? "—"}
                        </p>
                        
                        
                        {order
                          .shippingAddress
                          .phone && (
                          <p>
                            {
                              order
                                .shippingAddress
                                .phone
                            }
                          </p>
                        )}

                    
                        <p className="mt-2">
                          {order
                            .shippingAddress
                            .addressLine1 ??
                            "—"}
                        </p>
                        
                        
                        {order
                          .shippingAddress
                          .addressLine2 && (
                          <p>
                            {
                              order
                                .shippingAddress
                                .addressLine2
                            }
                          </p>
                        )}

                    
                        <p>
                          {order
                            .shippingAddress
                            .city}
                          {order
                            .shippingAddress
                            .city &&
                            order
                              .shippingAddress
                              .state
                            ? ", "
                            : ""}
                          {
                            order
                              .shippingAddress
                              .state
                          }
                        </p>
                      
                      
                        <p>
                          {
                            order
                              .shippingAddress
                              .postalCode
                          }
                        </p>
                      
                      
                        <p>
                          {
                            order
                              .shippingAddress
                              .country
                          }
                        </p>
                      
                      </div>
                      
                    </section>
                      
                  </div>
                      
                      
                  {/* RIGHT */}
                      
                  <div className="space-y-8">
                      
                    {/* PAYMENT */}
                      
                    <section className="rounded-3xl border bg-white p-6 shadow-sm">
                      
                      <div className="flex items-center gap-3">
                      
                        <div className="rounded-xl bg-gray-100 p-2.5">
                          <CreditCard className="h-5 w-5" />
                        </div>
                      
                        <h2 className="font-semibold">
                          Payment
                        </h2>
                      
                      </div>
                      
                      
                      <div className="mt-5 space-y-4">
                      
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">
                            Method
                          </p>
                      
                          <p className="mt-1 font-medium">
                            {order.paymentMethod ??
                              "Not available"}
                          </p>
                        </div>
                            
                            
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">
                            Payment Status
                          </p>
                            
                          <p className="mt-1 font-medium capitalize">
                            {prettyStatus(
                              order.paymentStatus ??
                                "pending"
                            )}
                          </p>
                        </div>
                        
                      </div>
                        
                    </section>
                        
                        
                    {/* PRICE DETAILS */}
                        
                    <section className="rounded-3xl border bg-white p-6 shadow-sm">
                        
                      <h2 className="font-semibold">
                        Price Details
                      </h2>
                        
                        
                      <div className="mt-5 space-y-3 text-sm">
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Subtotal
                          </span>
                        
                          <span>
                            {money(
                              order.subtotal
                            )}
                          </span>
                        </div>
                        
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Discount
                          </span>
                        
                          <span className="text-green-600">
                            -
                            {money(
                              order.discountAmount
                            )}
                          </span>
                        </div>
                        
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Shipping
                          </span>
                        
                          <span>
                            {Number(
                              order.shippingFee
                            ) === 0
                              ? "Free"
                              : money(
                                  order.shippingFee
                                )}
                          </span>
                        </div>
                            
                            
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Tax
                          </span>
                            
                          <span>
                            {money(
                              order.taxAmount
                            )}
                          </span>
                        </div>
                        
                        
                        <div className="mt-4 flex justify-between border-t pt-4 text-base font-semibold">
                        
                          <span>
                            Total
                          </span>
                        
                          <span>
                            {money(
                              order.totalAmount
                            )}
                          </span>
                        
                        </div>
                        
                      </div>
                        
                    </section>
                        
                  </div>
                        
                </div>

            </div>

        </div>

      </div>

    </main>
  );
}