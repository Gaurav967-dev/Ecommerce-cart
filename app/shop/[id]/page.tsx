import { notFound } from "next/navigation";

import { products } from "@/data/products";
import ProductDetails from "@/components/ProductDetails";

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const product = products.find((product) => product.id === Number(id));

    if(!product) {
        notFound();
    }

    return <ProductDetails product={product} />;
}