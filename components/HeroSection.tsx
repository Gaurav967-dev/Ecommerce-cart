"use client";

import Link from "next/link";

import { motion } from "motion/react";
import { CartIcon, ArrowRightIcon } from "lucide-animated";

export default function HeroSection() {
    return (
        <section className="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">

                {/* Hero Image */}
                <motion.img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
                    alt="Shopping collection"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/10" />
                
                {/* Content */}
                <div className="relative z-10 min-h-[calc(100svh-105px)] min-h-[500px] max-h-[720px] flex items-end">
                    <div className="w-full px-5 sm:px-10 lg:px-16 pb-8 sm:pb-12 lg:pb-14">

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="max-w-3xl text-white"
                        >
                            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em]">
                                New Collection
                            </p>

                            <h1 className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                                Discover Your
                                <span className="block">Next Favorite Product</span>
                            </h1>

                            <p className="mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base lg:text-lg leading-6 lg:leading-7 text-white/85">
                                Explore quality products, save your
                                favorites, and build your perfect
                                shopping cart.
                            </p>

                            {/* Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.45 }}
                                className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3"
                            >
                                <Link
                                    href="/shop"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-black font-medium hover:bg-gray-100 transition w-full sm:w-auto"
                                >
                                    <CartIcon size={20} />
                                    Shop Now
                                </Link>
                                
                                <Link
                                    href="/shop"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white bg-transparent px-6 py-3 text-white font-medium hover:bg-white hover:text-black transition w-full sm:w-auto"
                                >
                                    Explore Products
                                    <ArrowRightIcon size={20} />
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}