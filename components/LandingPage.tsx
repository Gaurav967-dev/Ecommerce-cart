"use client";

import Link from "next/link";

import { motion } from "motion/react";

import { buttonVariants } from "@/components/ui/button";

import {
  CartIcon,
  HeartIcon,
} from "lucide-animated";

export default function LandingPage() {
  return (
    <main className="overflow-hidden">

      {/* ================================
          HERO SECTION
      ================================= */}

      <section className="min-h-[calc(100vh-73px)] flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* LEFT CONTENT */}
            <motion.div
              initial={{
                opacity: 0,
                x: -40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.7,
              }}
              className="text-center lg:text-left"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 0.2,
                  duration: 0.5,
                }}
                className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary"
              >
                Welcome to our store
              </motion.p>

              <motion.h1
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.3,
                  duration: 0.6,
                }}
                className="
                  text-4xl
                  sm:text-5xl
                  lg:text-6xl
                  font-bold
                  leading-tight
                  mt-4
                "
              >
                Shop Your
                <span className="block">
                  Favorite Products
                </span>
              </motion.h1>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.45,
                  duration: 0.6,
                }}
                className="
                  text-base
                  sm:text-lg
                  text-muted-foreground
                  mt-5
                  max-w-xl
                  mx-auto
                  lg:mx-0
                  leading-7
                "
              >
                Discover quality products, add
                them to your cart or save your
                favorites to your wishlist.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.6,
                  duration: 0.6,
                }}
                className="
                  flex
                  flex-col
                  sm:flex-row
                  gap-3
                  sm:gap-4
                  justify-center
                  lg:justify-start
                  mt-7
                "
              >
                <Link
                  href="/shop"
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "w-full sm:w-auto",
                  })}
                >
                  <CartIcon size={20} />
                  Shop Now
                </Link>

                <Link
                  href="/wishlist"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className:
                      "w-full sm:w-auto",
                  })}
                >
                  <HeartIcon size={20} />
                  Wishlist
                </Link>
              </motion.div>
            </motion.div>

            {/* RIGHT IMAGE */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.8,
              }}
              className="
                flex
                justify-center
                w-full
                mt-4
                lg:mt-0
              "
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-full max-w-md lg:max-w-xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
                  alt="Online shopping"
                  className="
                    w-full
                    h-[300px]
                    sm:h-[400px]
                    lg:h-[500px]
                    object-cover
                    rounded-2xl
                    shadow-2xl
                  "
                />
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ================================
          FEATURES SECTION
      ================================= */}

      <section className="border-t py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.6,
            }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold">
              Everything You Need
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-xl mx-auto">
              Simple shopping experience with
              modern React features.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

            <FeatureCard
              icon={<CartIcon size={20} />}
              title="Shop Products"
              description="Browse our collection of products."
            />

            <FeatureCard
              icon={<HeartIcon size={20} />}
              title="Wishlist"
              description="Save your favorite products for later."
            />

            <FeatureCard
              icon={<CartIcon size={20} />}
              title="Shopping Cart"
              description="Add products and manage quantities."
            />

          </div>
        </div>
      </section>

    </main>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.2,
      }}
      className="
        border
        rounded-xl
        p-6
        sm:p-8
        text-center
      "
    >
      <div className="flex justify-center mb-4">
        {icon}
      </div>

      <h3 className="text-lg sm:text-xl font-semibold">
        {title}
      </h3>

      <p className="text-sm sm:text-base text-muted-foreground mt-3">
        {description}
      </p>
    </motion.div>
  );
}