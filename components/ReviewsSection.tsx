"use client";

import { motion } from "motion/react";

import { reviews } from "@/data/reviews";

export default function ReviewsSection() {
    return (
        <section className="py-16 sm:py-20 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10 sm:mb-12"
                >
                    <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                        Customer Love
                    </p>

                    <h2 className="mt-2 text-3xl sm:text-4xl font-bold">
                        What Our Customers Say
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.name}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08 }}
                            whileHover={{ y: -5 }}
                            className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-lg transition-shadow"
                        >
                            <div className="text-sm tracking-widest">
                                {"★".repeat(review.rating)}
                            </div>
                            
                            <p className="mt-5 leading-7 text-muted-foreground">
                                "{review.comment}"
                            </p>
                            
                            <p className="mt-5 font-semibold">
                                {review.name}
                            </p>

                            <p className="text-sm text-muted-foreground mt-1">
                                Verified Customer
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}