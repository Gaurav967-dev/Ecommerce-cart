"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";

import { HeartIcon, CircleCheckIcon, ArrowRightIcon, CartIcon, PlusIcon } from "lucide-animated";

import { Minus } from "lucide-react";

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
  const { wishlist, addToWishlist, removeFromWishlist, cart, addToCart, increaseQuantity, decreaseQuantity, recentlyViewed, addToRecentlyViewed } = useShop();

  const cartItem = cart.find(
    (item) => item.product.id === product.id
  );

  const quantity = cartItem?.quantity ?? 0;

  const isInCart = quantity > 0;

  const isWishlisted = wishlist.some(
    (item) => item.id === product.id
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

  function handleAddToCart() {
    if (!isInCart) {
      addToCart(product);
    }
  }

  return (
    <main className="overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

        {/* Back to Shop */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-5 sm:mb-6"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowRightIcon
              size={18}
              className="rotate-180"
            />

            Back to Shop
          </Link>
        </motion.div>

        {/* Product Layout */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start"
        >
          {/* =================================
              PRODUCT IMAGE
          ================================== */}

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0, }}
            transition={{ duration: 0.6 }}
            className="w-full overflow-hidden rounded-2xl"
          >
            <motion.img
              src={product.image}
              alt={product.name}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4 }}
              className="w-full h-[260px] sm:h-[340px] md:h-[400px] lg:h-[440px] object-cover rounded-2xl"
            />
          </motion.div>

          {/* =================================
              PRODUCT INFORMATION
          ================================== */}

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col justify-center lg:min-h-[460px]"
          >
            {/* Category */}
            <Badge
              variant="secondary"
              className="w-fit rounded-full"
            >
              {product.category}
            </Badge>

            {/* Product Name */}
            <h1
              className="mt-4 text-3xl sm:text-4xl font-bold leading-tight"
            >
              {product.name}
            </h1>

            {/* Price */}
            <p
              className="mt-4 text-2xl sm:text-3xl font-bold"
            >
              Rs. {product.price.toLocaleString("en-IN")}
            </p>

            {/* Description */}
            <div className="border-t border-b py-5 my-5">
              <h2 className="font-semibold mb-2">
                Product Description
              </h2>

              <p
                className="text-sm sm:text-base text-muted-foreground leading-7"
              >
                {product.description}
              </p>
            </div>

            {/* =================================
                CART / QUANTITY
            ================================== */}

            {!isInCart ? (
              <Button
                size="lg"
                className="w-full rounded-xl h-12"
                onClick={handleAddToCart}
              >
                <CartIcon size={20} />
                Add to Cart
              </Button>
            ) : (
              <div className="space-y-3">

                <p className="text-sm font-medium">
                  Quantity
                </p>

                <div
                  className="flex items-center justify-between rounded-xl border p-2"
                >
                  {/* Minus */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      decreaseQuantity(product.id)
                    }
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  {/* Quantity */}
                  <motion.span
                    key={quantity}
                    initial={{ scale: 0.75, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="min-w-12 text-center text-lg font-semibold"
                  >
                    {quantity}
                  </motion.span>

                  {/* Plus */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      increaseQuantity(product.id)
                    }
                    aria-label="Increase quantity"
                  >
                    <PlusIcon size={18} />
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CircleCheckIcon size={18} />
                  Added to Cart
                </div>
              </div>
            )}

            {/* =================================
                WISHLIST
            ================================== */}

            <Button
              size="lg"
              variant="outline"
              className="w-full rounded-xl mt-3 h-12"
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

            {/* Quantity Subtotal */}
            {isInCart && (
              <div className="mt-4 rounded-xl bg-muted/40 p-4">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Quantity
                  </span>

                  <span className="font-medium">
                    {quantity}
                  </span>
                </div>

                <div className="flex justify-between gap-4 mt-2">
                  <span className="font-semibold">
                    Subtotal
                  </span>

                  <span className="font-bold">
                    Rs. 
                    {(
                      product.price * quantity
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* =================================
            RECENTLY VIEWED
        ================================== */}

        {recentlyViewed.length > 1 && (
          <section className="mt-14 sm:mt-16 lg:mt-20">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <h2 className="text-2xl sm:text-3xl font-bold">
                Recently Viewed
              </h2>

              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Products viewed during this session.
              </p>
            </motion.div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
            >
              {recentlyViewed
                .filter(
                  (item) =>
                    item.id !== product.id
                )
                .map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ y: -6 }}
                  >
                    <Link
                      href={`/shop/${item.id}`}
                      className="group block overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-xl transition-shadow"
                    >
                      <div className="overflow-hidden">
                        <motion.img
                          src={item.image}
                          alt={item.name}
                          whileHover={{ scale: 1.06 }}
                          transition={{ duration: 0.5 }}
                          className="w-full h-48 object-cover"
                        />
                      </div>

                      <div className="p-4">
                        <p className="text-xs text-muted-foreground">
                          {item.category}
                        </p>

                        <h3 className="mt-1 font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>

                        <p className="mt-2 font-bold">
                          Rs. 
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