import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div>
                        <Link
                            href="/"
                            className="text-2xl font-bold"
                        >
                            E-Commerce
                        </Link>

                        <p className="mt-4 text-sm leading-6 text-muted-foreground max-w-xs">
                            A modern shopping experience built
                            with Next.js, React, TypeScript,
                            Tailwind, and shadcn/ui.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h3 className="font-semibold">
                            Shop
                        </h3>

                        <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
                            <Link
                                href="/shop"
                                className="hover:text-foreground transition"
                            >
                                Shop All
                            </Link>
                            
                            <Link
                                href="/shop"
                                className="hover:text-foreground transition"
                            >
                                Categories
                            </Link>

                            <Link
                                href="/wishlist"
                                className="hover:text-foreground transition"
                            >
                                Wishlist
                            </Link>

                            <Link
                                href="/cart"
                                className="hover:text-foreground transition"
                            >
                                Cart
                            </Link>
                        </div>
                    </div>

                    {/* Help */}
                    <div>
                        <h3 className="font-semibold">
                            Help
                        </h3>

                        <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
                            <Link
                                href="/contact"
                                className="hover:text-foreground transition"
                            >
                                Contact Us
                            </Link>

                            <Link
                                href="/help"
                                className="hover:text-foreground transition"
                            >
                                FAQ
                            </Link>

                            <Link
                                href="/help"
                                className="hover:text-foreground transition"
                            >
                                Shipping
                            </Link>

                            <Link
                                href="/help"
                                className="hover:text-foreground transition"
                            >
                                Returns
                            </Link>
                        </div>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="font-semibold">
                            About Us
                        </h3>

                        <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
                            <Link
                                href="/about"
                                className="hover:text-foreground transition"
                            >
                                Our Story
                            </Link>

                            <Link
                                href="/about"
                                className="hover:text-foreground transition"
                            >
                                About the Store
                            </Link>

                            <Link
                                href="/privacy"
                                className="hover:text-foreground transition"
                            >
                                Privacy Policy
                            </Link>

                            <Link
                                href="/terms"
                                className="hover:text-foreground transition"
                            >
                                Terms & Conditions
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t mt-10 pt-6 text-center text-sm text-muted-foreground">
                    © 2026 E-Commerce. All rights reserved.
                </div>
            </div>
        </footer>
    );
}