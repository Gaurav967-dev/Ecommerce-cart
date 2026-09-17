import type { Metadata } from "next";
import "./globals.css";
import { ShopProvider } from "@/context/ShopContext";

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
          {children}
        </ShopProvider>
      </body>
    </html>
  );
}