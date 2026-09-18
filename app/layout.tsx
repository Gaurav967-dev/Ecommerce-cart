import type { Metadata } from "next";
import "./globals.css";
import { ShopProvider } from "@/context/ShopContext";
import Navbar from "@/components/Navbar";

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

          <Navbar />

          {children}
          
        </ShopProvider>
      </body>
    </html>
  );
}