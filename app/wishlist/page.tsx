"use client";

import Link from "next/link";

import { motion } from "motion/react";

import {
  HeartIcon,
  CartIcon,
  CheckIcon,
} from "lucide-animated";

import { Trash2 } from "lucide-react";

import { useShop } from "@/context/ShopContext";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WishlistPage() {
  const {
    wishlist,
    removeFromWishlist,
    addToCart,
    cart,
  } = useShop();

  // ==========================================
  // EMPTY WISHLIST
  // ==========================================

  if (wishlist.length === 0) {
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
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <HeartIcon
              size={64}
              className="mx-auto"
            />
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-bold mt-6">
            Your Wishlist Is Empty
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Save your favorite products and find
            them here later.
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">

        {/* =====================================
            HEADER
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
          <div className="flex items-center gap-3">
            <HeartIcon size={28} />

            <h1 className="text-3xl sm:text-4xl font-bold">
              My Wishlist
            </h1>
          </div>

          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            {wishlist.length}{" "}
            {wishlist.length === 1
              ? "product"
              : "products"}{" "}
            saved
          </p>
        </motion.div>

        {/* =====================================
            WISHLIST GRID
        ====================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            gap-5
            sm:gap-6
          "
        >
          {wishlist.map((product, index) => {
            const isInCart = cart.some(
              (item) =>
                item.product.id === product.id
            );

            return (
              <motion.div
                key={product.id}
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
                whileHover={{
                  y: -6,
                }}
                className="
                  group
                  h-full
                  overflow-hidden
                  rounded-2xl
                  border
                  bg-card
                  shadow-sm
                  transition-shadow
                  duration-300
                  hover:shadow-xl
                "
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <Link
                    href={`/shop/${product.id}`}
                  >
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      whileHover={{
                        scale: 1.06,
                      }}
                      transition={{
                        duration: 0.5,
                      }}
                      className="
                        w-full
                        h-64
                        sm:h-56
                        lg:h-64
                        object-cover
                        cursor-pointer
                      "
                    />
                  </Link>

                  {/* Category */}
                  <Badge
                    variant="secondary"
                    className="
                      absolute
                      left-3
                      top-3
                      rounded-full
                      bg-background/90
                      backdrop-blur
                    "
                  >
                    {product.category}
                  </Badge>

                  {/* Remove Wishlist */}
                  <motion.div
                    whileTap={{
                      scale: 0.85,
                    }}
                    className="
                      absolute
                      right-3
                      top-3
                    "
                  >
                    <Button
                      variant="secondary"
                      size="icon"
                      className="
                        rounded-full
                        bg-background/90
                        backdrop-blur
                        shadow-sm
                        hover:bg-background
                      "
                      onClick={() =>
                        removeFromWishlist(
                          product.id
                        )
                      }
                      aria-label="Remove from wishlist"
                    >
                      <HeartIcon
                        size={20}
                        className="text-red-500"
                      />
                    </Button>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="flex h-[230px] flex-col p-5">

                  <Link
                    href={`/shop/${product.id}`}
                  >
                    <h2
                      className="
                        line-clamp-1
                        text-lg
                        font-semibold
                        transition-colors
                        group-hover:text-primary
                      "
                    >
                      {product.name}
                    </h2>
                  </Link>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {product.description}
                  </p>

                  <p className="mt-4 text-2xl font-bold">
                    ₹
                    {product.price.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  {/* Actions */}
                  <div className="mt-auto flex flex-col gap-2 pt-4">

                    {/* Add to Cart */}
                    <Button
                      className="w-full rounded-xl"
                      variant={
                        isInCart
                          ? "secondary"
                          : "default"
                      }
                      disabled={isInCart}
                      onClick={() =>
                        addToCart(product)
                      }
                    >
                      {isInCart ? (
                        <>
                          <CheckIcon size={20} />
                          Added to Cart
                        </>
                      ) : (
                        <>
                          <CartIcon size={20} />
                          Add to Cart
                        </>
                      )}
                    </Button>

                    {/* Remove */}
                    <Button
                      variant="ghost"
                      className="
                        w-full
                        rounded-xl
                        text-destructive
                        hover:bg-destructive/10
                        hover:text-destructive
                      "
                      onClick={() =>
                        removeFromWishlist(
                          product.id
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove from Wishlist
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}