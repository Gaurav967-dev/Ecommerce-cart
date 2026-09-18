"use client";

import Link from "next/link";

import { motion } from "motion/react";
import { HeartIcon, CartIcon, CheckIcon} from "lucide-animated";
import { Product } from "@/types/product";
import { useShop } from "@/context/ShopContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const { wishlist, addToWishlist, removeFromWishlist, cart, addToCart} = useShop();

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const isInCart = cart.some((item) => item.product.id === product.id);

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
    <motion.div
      whileHover={{
        y: -6,
      }}
      transition={{
        duration: 0.2,
      }}
      className="h-full"
    >
      <Card className="group h-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl">

        {/* Product Image */}
        <div className="relative overflow-hidden">
          <Link href={`/shop/${product.id}`}>
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

          {/* Wishlist */}
          <motion.div
            whileTap={{
              scale: 0.85,
            }}
            className="absolute right-3 top-3"
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
              onClick={handleWishlist}
              aria-label={
                isWishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
            >
              <HeartIcon
                size={20}
                className={
                  isWishlisted
                    ? "text-red-500"
                    : ""
                }
              />
            </Button>
          </motion.div>
        </div>

        {/* Content */}
        <CardContent className="flex h-[220px] flex-col p-5">

          <Link href={`/shop/${product.id}`}>
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
            Rs. {product.price.toLocaleString("en-IN")}
          </p>

          <div className="mt-auto pt-4">
            <Button
              className="w-full rounded-xl"
              variant={
                isInCart
                  ? "secondary"
                  : "default"
              }
              disabled={isInCart}
              onClick={handleAddToCart}
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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}