import type { Metadata } from "next";
import { Suspense } from "react";
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
        <ShopProvider>

          <Suspense fallback={null}>
            <Navbar />
          </Suspense>

          {children}

          <Footer />
        </ShopProvider>
      </body>
    </html>
  );
}