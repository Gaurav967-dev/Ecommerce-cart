"use client";

import { useEffect } from "react";
import Link from "next/link";

import { motion } from "motion/react";

import {
  HeartIcon,
  CircleCheckIcon,
  ArrowRightIcon,
  CartIcon,
} from "lucide-animated";

import { Product } from "@/types/product";
import { useShop } from "@/context/ShopContext";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({
  product,
}: ProductDetailsProps) {
  const {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    cart,
    addToCart,
    recentlyViewed,
    addToRecentlyViewed,
  } = useShop();

  const isWishlisted = wishlist.some(
    (item) => item.id === product.id
  );

  const isInCart = cart.some(
    (item) => item.product.id === product.id
  );

  useEffect(() => {
    addToRecentlyViewed(product);
  }, [product, addToRecentlyViewed]);

  function handleWishlist() {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }

  function handleCart() {
    if (!isInCart) {
      addToCart(product);
    }
  }

  return (
    <main className="overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">

        {/* Back to Shop */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 sm:mb-8"
        >
          <Link
            href="/shop"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              text-muted-foreground
              hover:text-foreground
              transition
            "
          >
            <ArrowRightIcon
              size={18}
              className="rotate-180"
            />
            Back to Shop
          </Link>
        </motion.div>

        {/* Product */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* Image */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.6,
            }}
            className="overflow-hidden rounded-2xl"
          >
            <motion.img
              src={product.image}
              alt={product.name}
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.5 }}
              className="
                w-full
                h-[320px]
                sm:h-[450px]
                lg:h-[600px]
                object-cover
              "
            />
          </motion.div>

          {/* Information */}
          <motion.div
            initial={{
              opacity: 0,
              x: 30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
          >
            <Badge
              variant="secondary"
              className="rounded-full"
            >
              {product.category}
            </Badge>

            <h1 className="
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-bold
              leading-tight
              mt-4
            ">
              {product.name}
            </h1>

            <p className="
              text-2xl
              sm:text-3xl
              font-bold
              mt-5
            ">
              Rs. {product.price.toLocaleString("en-IN")}
            </p>

            <div className="border-t border-b py-6 my-6">
              <h2 className="font-semibold mb-3">
                Product Description
              </h2>

              <p className="
                text-sm
                sm:text-base
                text-muted-foreground
                leading-7
              ">
                {product.description}
              </p>
            </div>

            {/* Actions */}
            <div className="
              flex
              flex-col
              sm:flex-row
              gap-3
            ">
              <Button
                size="lg"
                className="w-full sm:flex-1 rounded-xl"
                variant={
                  isInCart
                    ? "secondary"
                    : "default"
                }
                disabled={isInCart}
                onClick={handleCart}
              >
                {isInCart ? (
                  <>
                    <CircleCheckIcon size={20} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <CartIcon size={20} />
                    Add to Cart
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full sm:flex-1 rounded-xl"
                onClick={handleWishlist}
              >
                <HeartIcon
                  size={20}
                  className={
                    isWishlisted
                      ? "text-red-500"
                      : ""
                  }
                />

                {isWishlisted
                  ? "Remove from Wishlist"
                  : "Add to Wishlist"}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 1 && (
          <section className="mt-16 sm:mt-20">

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h2 className="
                text-2xl
                sm:text-3xl
                font-bold
              ">
                Recently Viewed
              </h2>

              <p className="
                text-sm
                sm:text-base
                text-muted-foreground
                mt-2
              ">
                Products viewed during this session.
              </p>
            </motion.div>

            <div className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-5
              sm:gap-6
            ">
              {recentlyViewed
                .filter(
                  (item) =>
                    item.id !== product.id
                )
                .map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay: index * 0.08,
                    }}
                    whileHover={{
                      y: -6,
                    }}
                  >
                    <Link
                      href={`/shop/${item.id}`}
                      className="
                        group
                        block
                        overflow-hidden
                        rounded-2xl
                        border
                        bg-card
                        shadow-sm
                        hover:shadow-xl
                        transition-shadow
                      "
                    >
                      <div className="overflow-hidden">
                        <motion.img
                          src={item.image}
                          alt={item.name}
                          whileHover={{
                            scale: 1.06,
                          }}
                          transition={{
                            duration: 0.5,
                          }}
                          className="
                            w-full
                            h-48
                            object-cover
                          "
                        />
                      </div>

                      <div className="p-4">
                        <p className="text-xs text-muted-foreground">
                          {item.category}
                        </p>

                        <h3 className="
                          mt-1
                          font-semibold
                          line-clamp-1
                          group-hover:text-primary
                          transition-colors
                        ">
                          {item.name}
                        </h3>

                        <p className="mt-2 font-bold">
                          ₹
                          {item.price.toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}