import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

interface ShopPageProps {
  searchParams?: Promise<{
    search?: string;
    category?: string;
  }>;
}

export default async function ShopPage({
  searchParams,
}: ShopPageProps) {
  const params = await searchParams;

  const search =
    params?.search?.trim().toLowerCase() || "";

  const category =
    params?.category?.trim() || "";

  const filteredProducts = products.filter(
    (product) => {
      const matchesSearch =
        !search ||
        [
          product.name,
          product.category,
          product.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        !category ||
        product.category.toLowerCase() ===
          category.toLowerCase();

      return matchesSearch && matchesCategory;
    }
  );

  return (
    <main className="overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Store
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold mt-2">
            Shop
          </h1>

          {/* Active filters */}
          {(search || category) && (
            <div className="flex flex-wrap items-center gap-3 mt-4">

              {search && (
                <span className="rounded-full bg-muted px-3 py-1 text-sm">
                  Search:{" "}
                  <strong>{search}</strong>
                </span>
              )}

              {category && (
                <span className="rounded-full bg-muted px-3 py-1 text-sm">
                  Category:{" "}
                  <strong>{category}</strong>
                </span>
              )}

              <Link
                href="/shop"
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear all
              </Link>
            </div>
          )}
        </div>

        {/* Products */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="min-h-[300px] flex items-center justify-center border rounded-2xl">
            <div className="text-center px-6">
              <h2 className="text-xl sm:text-2xl font-semibold">
                No products found
              </h2>

              <p className="text-muted-foreground mt-2">
                Try another search or category.
              </p>

              <Link
                href="/shop"
                className="inline-block mt-4 text-primary font-medium hover:underline"
              >
                View all products
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}