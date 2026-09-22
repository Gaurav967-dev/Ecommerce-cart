"use client";

import Link from "next/link";

import { motion } from "motion/react";
import { ArrowRightIcon } from "lucide-animated";

import { categories } from "@/data/categories"

export default function CategorySection() {
    return (
        <section className="py-12 sm:py-16 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col sm:flex-row sm:items-end sm:justify between gap-4 mb-8"
                >
                    <div>
                        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                            Explore
                        </p>

                        <h2 className="mt-2 text-3xl sm:text-4xl font-bold">
                            Shop By Category
                        </h2>

                        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                            Find products from your favorite categories.
                        </p>
                    </div>

                    <Link
                        href="/shop"
                        className="hidden sm:inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                    >
                        View All
                        <ArrowRightIcon size={18} />
                    </Link>
                </motion.div>

                {/* Category Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -8 }}
                        >
                            <Link
                                href={`/shop?category=${encodeURIComponent(
                                    category.name
                                )}`}
                                className="group relative block overflow-hidden rounded-2xl sm:rounded-3xl border bg-card shadow-sm hover:shadow-xl transition-shadow duration-300"
                            >
                                {/* Image */}
                                <div className="relative overflow-hidden">
                                    <motion.img
                                        src={category.image}
                                        alt={category.name}
                                        whileHover={{ scale: 1.08 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="w-full h-[280px] sm:h-[320px] lg:h-[360px] object-cover"
                                    />

                                    {/* Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                    {/* Category Content */}    
                                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                                        <div className="flex items-end justify-between gap-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-widest text-white/70">
                                                    Explore
                                                </p>
                                
                                                <h3 className="mt-1 text-2xl sm:text-3xl font-bold text-white">
                                                    {category.name}
                                                </h3>
                                            </div>

                                            {/* Arrow */}
                                            <motion.div
                                                initial={{ x: 0 }}
                                                whileHover={{ x: 5 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black"
                                            >
                                                <ArrowRightIcon size={19} />
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Mobile View All */}
                <Link
                    href="/shop"
                    className="mt-6 sm:hidden flex items-center justify-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                >
                    View All Products
                    <ArrowRightIcon size={18} />
                </Link>
            </div>
        </section>
    );
}