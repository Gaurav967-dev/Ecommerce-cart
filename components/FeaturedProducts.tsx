"use client";

import Link from "next/link";

import { motion } from "motion/react";
import { ArrowRightIcon } from "lucide-animated";

import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

export default function FeaturedProducts() {
    const featuredProducts = products.slice(0, 4);

    return (
        <section className="bg-muted/30 py-14 sm:py-18 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between"
                >
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">
                            Featured Collection
                        </p>

                        <h2 className="mt-2 text-3xl sm:text-4xl font-bold">
                            Trending Products
                        </h2>

                        <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                            Explore some of our most popular products
                            and discover something you'll love.
                        </p>
                    </div>

                    <Link
                        href="/shop"
                        className="hidden items-center gap-2 text-sm font-medium transition-colors hover:text-primary sm:inline-flex"
                    >
                        View All Products
                        <ArrowRightIcon size={18} />
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                    {featuredProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </div>

                <Link
                    href="/shop"
                    className="mt-7 flex items-center justify-center gap-2 text-sm font-medium transition-colors hover:text-primary sm:hidden"
                >
                    View All Products
                    <ArrowRightIcon size={18} />
                </Link>
            </div>
        </section>
    );
}