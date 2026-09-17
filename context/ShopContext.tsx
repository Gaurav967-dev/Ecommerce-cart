"use client";

import {createContext, useContext, useEffect, useState, ReactNode} from "react";
import {Product} from "@/types/product";

interface ShopContextType {
    wishlist: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: number) => void;

    cart: Product[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({children}: {children:ReactNode}){
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [cart, setCart] = useState<Product[]>([]);

    const [wishlistLoaded, setWishlistLoaded] = useState(false);
    const [cartLoaded, setCartLoaded] = useState(false);

    useEffect(() => {
        if(!wishlistLoaded){
            return;
        }

        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist, wishlistLoaded]);

    useEffect(() => {
        const savedWishlist = localStorage.getItem("wishlist");

        if(savedWishlist){
            setWishlist(JSON.parse(savedWishlist));
        }
        setWishlistLoaded(true);
    }, []);

    useEffect(() => {
        if(!cartLoaded){
            return;
        }

        document.cookie="cart=" + encodeURIComponent(JSON.stringify(cart)) + "; max-age=86400; path=/";
    }, [cart, cartLoaded]);

    useEffect(() => {
        const cookies = document.cookie.split("; ");

        const cartCookie = cookies.find((cookie) => cookie.startsWith("cart="));

        if(cartCookie){
            const cartData = cartCookie.split("=")[1];

            if(cartData){
                setCart(JSON.parse(decodeURIComponent(cartData)));
            }
        }
        setCartLoaded(true);
    }, []);

    function addToWishlist(product: Product){
        setWishlist((currentWishlist) => {
            if(currentWishlist.some((item) => item.id === product.id)){
                return currentWishlist;
            }
            return [...currentWishlist, product];
        });
    }

    function removeFromWishlist(productId: number){
        setWishlist((currentWishlist) => currentWishlist.filter((item) => item.id !== productId));
    }

    function addToCart(product: Product){
        setCart((currentCart) => {
            if(currentCart.some((item) => item.id === product.id)){
                return currentCart;
            }
            return [...currentCart, product];
        });
    }

    function removeFromCart(productId: number){
        setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
    }

    return (
        <ShopContext.Provider value={{wishlist, addToWishlist, removeFromWishlist, cart, addToCart, removeFromCart}}>
            {children}
        </ShopContext.Provider>
    );
}

export function useShop(){
    const context = useContext(ShopContext);

    if(!context){
        throw new Error("useShop must be used inside ShopProvider");
    }

    return context;
}