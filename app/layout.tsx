import type { Metadata } from "next";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";

import "./globals.css";
import { ShopProvider } from "@/context/ShopContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "E-Commerce Store",
  description: "Cart and Wishlist App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>){
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ShopProvider>

            <Suspense fallback={null}>
              <Navbar />
            </Suspense>

            {children}

            <Footer />
          </ShopProvider>
        </SessionProvider>
      </body>
    </html>
  );
}