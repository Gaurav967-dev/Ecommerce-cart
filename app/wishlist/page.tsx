"use client";

import { useShop } from "@/context/ShopContext";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from "lucide-react";

export default function WishlistPage() {
  const {
    wishlist,
    removeFromWishlist,
    addToCart,
  } = useShop();

  if (wishlist.length === 0) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">
          My Wishlist
        </h1>

        <div className="text-center mt-16">
          <Heart className="mx-auto h-12 w-12" />

          <h2 className="text-xl font-semibold mt-4">
            Your wishlist is empty
          </h2>

          <p className="text-muted-foreground mt-2">
            Add some products to your wishlist.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        My Wishlist
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg overflow-hidden"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-cover"
            />

            <div className="p-4">
              <h2 className="text-xl font-semibold">{product.name}</h2>

              <p className="text-2xl font-bold mt-2">Rs. {product.price}</p>

              <div className="flex gap-2 mt-4">
                <Button
                  className="flex-1"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </Button>

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() =>
                    removeFromWishlist(product.id)
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}