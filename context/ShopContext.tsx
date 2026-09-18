"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

import { Product } from "@/types/product";
import { CartItem } from "@/types/cart";

interface ShopContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;

  cart: CartItem[];
  addToCart: (product: Product) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  
  recentlyViewed: Product[];
  addToRecentlyViewed: (product: Product) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(
  undefined
);

export function ShopProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [recentlyViewedLoaded, setRecentlyViewedLoaded] = useState(false);

  const [wishlistLoaded, setWishlistLoaded] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);

  // ==========================================
  // WISHLIST - LOAD FROM LOCAL STORAGE
  // ==========================================

  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");

    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);

        if (Array.isArray(parsedWishlist)) {
          setWishlist(parsedWishlist);
        }
      } catch (error) {
        console.error(
          "Invalid wishlist data:",
          error
        );

        localStorage.removeItem("wishlist");
      }
    }

    setWishlistLoaded(true);
  }, []);

  // ==========================================
  // WISHLIST - SAVE TO LOCAL STORAGE
  // ==========================================

  useEffect(() => {
    if (!wishlistLoaded) {
      return;
    }

    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist, wishlistLoaded]);

  // ==========================================
  // CART - LOAD FROM COOKIE
  // ==========================================

  useEffect(() => {
    const cartCookie = document.cookie
      .split("; ")
      .find((cookie) =>
        cookie.startsWith("cart=")
      );

    if (cartCookie) {
      const cartData = cartCookie.slice(
        "cart=".length
      );

      try {
        const decodedCart =
          decodeURIComponent(cartData);

        const savedCart = JSON.parse(decodedCart);

        if (Array.isArray(savedCart)) {
          setCart(savedCart);
        } else {
          document.cookie =
            "cart=; max-age=0; path=/";
        }
      } catch (error) {
        console.error(
          "Invalid cart cookie:",
          error
        );

        document.cookie =
          "cart=; max-age=0; path=/";
      }
    }

    setCartLoaded(true);
  }, []);

  // ==========================================
  // CART - SAVE TO COOKIE
  // ==========================================

  function saveCartToCookie(
    cartItems: CartItem[]
  ) {
    if (cartItems.length === 0) {
      document.cookie =
        "cart=; max-age=0; path=/";

      return;
    }

    const encodedCart = encodeURIComponent(
      JSON.stringify(cartItems)
    );

    document.cookie =
      `cart=${encodedCart}; max-age=86400; path=/`;
  }

  // Load from Session Storage
  useEffect(() => {
    const savedRecentlyViewed =
        sessionStorage.getItem(
          "recentlyViewed"
        );

    if (savedRecentlyViewed) {
      try {
        const parsedRecentlyViewed =
          JSON.parse(savedRecentlyViewed);

        if (Array.isArray(parsedRecentlyViewed)) {
          setRecentlyViewed(
            parsedRecentlyViewed
          );
        }
      } catch (error) {
        console.error(
          "Invalid recently viewed data:",
          error
        );

        sessionStorage.removeItem(
          "recentlyViewed"
        );
      }
    }

    setRecentlyViewedLoaded(true);
  }, []);

  // Save to session storage
  useEffect(() => {
      if (!recentlyViewedLoaded) {
        return;
      }

      sessionStorage.setItem(
        "recentlyViewed",
        JSON.stringify(recentlyViewed)
      );
    }, [recentlyViewed, recentlyViewedLoaded]);

  // ==========================================
  // WISHLIST FUNCTIONS
  // ==========================================

  function addToWishlist(product: Product) {
    setWishlist((currentWishlist) => {
      if (
        currentWishlist.some(
          (item) => item.id === product.id
        )
      ) {
        return currentWishlist;
      }

      return [...currentWishlist, product];
    });
  }

  function removeFromWishlist(
    productId: number
  ) {
    setWishlist((currentWishlist) =>
      currentWishlist.filter(
        (item) => item.id !== productId
      )
    );
  }

  // ==========================================
  // CART - ADD PRODUCT
  // ==========================================

  function addToCart(product: Product) {
    const existingItem = cart.find(
      (item) => item.product.id === product.id
    );

    let newCart: CartItem[];

    if (existingItem) {
      newCart = cart.map((item) =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );
    } else {
      newCart = [
        ...cart,
        {
          product,
          quantity: 1,
        },
      ];
    }

    setCart(newCart);
    saveCartToCookie(newCart);
  }

  // ==========================================
  // CART - INCREASE QUANTITY
  // ==========================================

  function increaseQuantity(
    productId: number
  ) {
    const newCart = cart.map((item) =>
      item.product.id === productId
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );

    setCart(newCart);
    saveCartToCookie(newCart);
  }

  // ==========================================
  // CART - DECREASE QUANTITY
  // ==========================================

  function decreaseQuantity(
    productId: number
  ) {
    const newCart = cart
      .map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    setCart(newCart);
    saveCartToCookie(newCart);
  }

  // ==========================================
  // CART - REMOVE COMPLETELY
  // ==========================================

  function removeFromCart(
    productId: number
  ) {
    const newCart = cart.filter(
      (item) => item.product.id !== productId
    );

    setCart(newCart);
    saveCartToCookie(newCart);
  }

  const addToRecentlyViewed = useCallback(
    (product: Product) => {
        setRecentlyViewed((currentProducts) => {
            const withoutCurrentProduct =
                currentProducts.filter(
                    (item) => item.id !== product.id
                );

            return [
                product,
                ...withoutCurrentProduct,
            ].slice(0, 4);
        });
    },
    []
  );

  return (
    <ShopContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,

        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,

        recentlyViewed,
        addToRecentlyViewed,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error(
      "useShop must be used inside ShopProvider"
    );
  }

  return context;
}