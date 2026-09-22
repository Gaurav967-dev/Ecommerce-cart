"use client";

import Link from "next/link";

import { motion } from "motion/react";
import { ArrowRightIcon } from "lucide-animated";

export default function StorySection() {
    return (
        <section className="py-16 sm:py-20 lg:py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7 }}
                        className="relative"
                    >
                        <div className="absolute -left-3 -top-3 sm:-left-5 sm:-top-5 h-20 w-20 sm:h-28 sm:w-28 rounded-full bg-primary/10 -z-10" />

                        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
                            <motion.img
                                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d"
                                alt="Our store story"
                                whileHover={{ scale: 1.04 }}
                                transition={{ duration: 0.6 }}
                                className="w-full h-[350px] sm:h-[450px] lg:h-[560px] object-cover"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-2xl bg-white px-5 py-4 shadow-xl"
                        >
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                Since 2026
                            </p>

                            <p className="mt-1 font-bold text-lg">
                                Made for better shopping
                            </p>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount:0.2 }}
                        transition={{ duration: 0.7 }}
                    >
                        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                            Our Story
                        </p>

                        <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                            Built Around
                            <span className="block">
                                Better Shopping
                            </span>
                        </h2>

                        <p className="mt-6 text-sm sm:text-base lg:text-lg leading-7 text-muted-foreground">
                            We created this store with one simple
                            idea: shopping should feel easy,
                            enjoyable, and intuitive.
                        </p>

                        <p className="mt-4 text-sm sm:text-base leading-7 text-muted-foreground">
                            From discovering a product to saving
                            it for later and managing your cart,
                            every part of the experience is designed
                            to work smoothly across desktop,
                            tablet, and mobile.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">

                            <div className="rounded-2xl border p-5">
                                <p className="text-2xl font-bold">
                                    100%
                                </p>
                                
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Responsive experience
                                </p>
                            </div>

                            <div className="rounded-2xl border p-5">
                                <p className="text-2xl font-bold">
                                    24/7
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Easy product discovery
                                </p>
                            </div>

                        </div>

                        <Link
                            href="/shop"
                            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
                        >
                            Explore Our Products
                            <ArrowRightIcon size={20} />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}