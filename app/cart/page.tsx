"use client";

import { useShop } from "@/context/ShopContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";

export default function CartPage() {
    const {
        cart,
        removeFromCart,
    } = useShop();

    const total = cart.reduce(
        (sum, product) => sum + product.price,
        0,
    );

    if (cart.length === 0) {
        return (
            <main className="p-8">
                <h1 className="text-3xl font-bold">
                    My Cart
                </h1>

                <div className="text-center mt-16">
                    <ShoppingCart className="mx-auto h-12 w-12" />

                    <h2 className="text-xl font-semibold mt-4">
                        Your cart is empty
                    </h2>

                    <p className="text-muted-foreground mt-2">
                        Add some products to your cart.
                    </p>
                </div>
            </main>
        );
    }

    return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        My Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-4">
          {cart.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 flex gap-4"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-32 h-32 object-cover rounded-md"
              />

              <div className="flex-1">
                <h2 className="text-xl font-semibold">{product.name}</h2>

                <p className="text-lg font-bold mt-2">Rs. {product.price}</p>

                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-4"
                  onClick={() =>
                    removeFromCart(product.id)
                  }
                >
                  <Trash2 />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="border rounded-lg p-6 h-fit">
          <h2 className="text-2xl font-bold">Order Summary</h2>

          <div className="flex justify-between mt-6">
            <span>Items</span>
            <span>{cart.length}</span>
          </div>

          <div className="flex justify-between mt-4"><span>Total</span>

            <span className="text-xl font-bold">Rs. {total}</span>
          </div>

          <Button className="w-full mt-6">
            Proceed to Checkout
          </Button>
        </div>

      </div>
    </main>
  );
}