import { Product } from "@/types/product";

export interface CartItem {
    product: Product;
    quantity: number;
}