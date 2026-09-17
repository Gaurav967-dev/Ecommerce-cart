"use client";

import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { useShop } from "@/context/ShopContext";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const {wishlist, addToWishlist, removeFromWishlist, addToCart} = useShop();

    const isWishlisted = wishlist.some((item) => item.id === product.id);

    function handleWishlist(){
        if(isWishlisted){
            removeFromWishlist(product.id);
        }else{
            addToWishlist(product);
        }
    }

    return (
        <Card className="overflow-hidden">
            <div className="relative">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                />

                <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-3 right-3 rounded-full"
                    onClick={handleWishlist}
                >
                    <Heart
                        className={isWishlisted ? "fill-red-500 text-red-500" : ""}
                    />
                </Button>
            </div>

            <CardContent className="p-4">
                <Badge variant="secondary">{product.category}</Badge>

                <h2 className="text-xl font-semibold mt-3">{product.name}</h2>
                
                <p className="text-2xl font-bold mt-2">Rs. {product.price}</p>

                <Button 
                    className="w-full mt-4"
                    onClick={() => addToCart(product)}    
                >
                    <ShoppingCart />
                    Add to Cart
                </Button>
            </CardContent>
        </Card>
    );
}