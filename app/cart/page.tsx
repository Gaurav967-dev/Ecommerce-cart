"use client";

import { motion } from "motion/react";

import {
  CartIcon,
  PlusIcon,
} from "lucide-animated";

import {
  Minus,
  Trash2,
} from "lucide-react";

import { useShop } from "@/context/ShopContext";

import { Button } from "@/components/ui/button";

export default function CartPage() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useShop();

  const total = cart.reduce(
    (sum, item) =>
      sum +
      item.product.price * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) =>
      sum + item.quantity,
    0
  );

  // ==========================================
  // EMPTY CART
  // ==========================================

  if (cart.length === 0) {
    return (
      <main className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <CartIcon
              size={64}
              className="mx-auto"
            />
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-bold mt-6">
            Your Cart Is Empty
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Add some products to your cart and
            they will appear here.
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">

        {/* =====================================
            PAGE HEADER
        ====================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-8 sm:mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold">
            My Cart
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            {totalItems}{" "}
            {totalItems === 1
              ? "item"
              : "items"}{" "}
            in your cart
          </p>
        </motion.div>

        {/* =====================================
            CART + SUMMARY
        ====================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

          {/* ===================================
              CART ITEMS
          ==================================== */}

          <div className="lg:col-span-2 space-y-4">

            {cart.map((item, index) => (
              <motion.div
                key={item.product.id}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.08,
                }}
                className="
                  group
                  rounded-2xl
                  border
                  bg-card
                  p-4
                  sm:p-5
                  shadow-sm
                  transition-shadow
                  duration-300
                  hover:shadow-lg
                "
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">

                  {/* Product Image */}
                  <div className="overflow-hidden rounded-xl shrink-0">
                    <motion.img
                      src={item.product.image}
                      alt={item.product.name}
                      whileHover={{
                        scale: 1.05,
                      }}
                      transition={{
                        duration: 0.4,
                      }}
                      className="
                        w-full
                        sm:w-32
                        md:w-36
                        h-52
                        sm:h-32
                        md:h-36
                        object-cover
                      "
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">

                    <h2 className="
                      text-lg
                      sm:text-xl
                      font-semibold
                      truncate
                    ">
                      {item.product.name}
                    </h2>

                    <p className="text-sm text-muted-foreground mt-1">
                      {item.product.category}
                    </p>

                    <p className="text-xl font-bold mt-3">
                      ₹{item.product.price.toLocaleString("en-IN")}
                    </p>

                    {/* Quantity */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-5">

                      <div className="flex items-center rounded-xl border overflow-hidden">

                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-none"
                          onClick={() =>
                            decreaseQuantity(
                              item.product.id
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <motion.span
                          key={item.quantity}
                          initial={{
                            scale: 0.8,
                            opacity: 0,
                          }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                          }}
                          className="
                            w-10
                            text-center
                            font-semibold
                          "
                        >
                          {item.quantity}
                        </motion.span>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-none"
                          onClick={() =>
                            increaseQuantity(
                              item.product.id
                            )
                          }
                          aria-label="Increase quantity"
                        >
                          <PlusIcon size={18} />
                        </Button>

                      </div>

                      {/* Subtotal */}
                      <p className="font-semibold">
                        ₹
                        {(
                          item.product.price *
                          item.quantity
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Remove */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="
                        mt-4
                        text-destructive
                        hover:text-destructive
                        hover:bg-destructive/10
                      "
                      onClick={() =>
                        removeFromCart(
                          item.product.id
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>

                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ===================================
              ORDER SUMMARY
          ==================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="
              lg:sticky
              lg:top-24
              rounded-2xl
              border
              bg-card
              p-5
              sm:p-6
              shadow-sm
            "
          >
            <h2 className="text-xl sm:text-2xl font-bold">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">

              <div className="flex justify-between gap-4 text-sm sm:text-base">
                <span className="text-muted-foreground">
                  Items
                </span>

                <span className="font-medium">
                  {totalItems}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm sm:text-base">
                <span className="text-muted-foreground">
                  Subtotal
                </span>

                <span className="font-medium">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="border-t pt-5 flex justify-between gap-4">
                <span className="font-semibold">
                  Total
                </span>

                <motion.span
                  key={total}
                  initial={{
                    scale: 0.9,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  className="text-xl sm:text-2xl font-bold"
                >
                  ₹{total.toLocaleString("en-IN")}
                </motion.span>
              </div>
            </div>

            <Button
              className="w-full mt-6 rounded-xl"
              size="lg"
            >
              Proceed to Checkout
            </Button>
          </motion.div>
        </div>
      </div>
    </main>
  );
}