import ProductCard from "@/components/ProductCard";
import {products} from "@/data/products";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        Our Products
      </h1>

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