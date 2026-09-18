import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

export default function ShopPage() {
  return (
    <main className="max-w-7xl mx-auto p-8">

      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Shop
        </h1>

        <p className="text-muted-foreground mt-2">
          Explore our collection of products.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

    </main>
  );
}