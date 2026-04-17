"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartContextType, CartItem, Product } from "@/lib/types";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ckkorea-cart");
    const savedSelection = localStorage.getItem("ckkorea-cart-selection");

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CartItem[];
        const normalizedItems = parsed.map((item) => ({
          ...item,
          product: {
            ...item.product,
            id: String(item.product.id),
          },
          quantity: Math.min(
            Math.max(item.quantity, Math.max(item.product.minimumOrderQuantity ?? 1, 1)),
            typeof item.product.stockQuantity === "number"
              ? item.product.stockQuantity
              : Number.POSITIVE_INFINITY
          ),
        }));

        setCartItems(normalizedItems);

        if (savedSelection) {
          try {
            const parsedSelection = JSON.parse(savedSelection) as string[];
            setSelectedProductIds(
              parsedSelection.filter((productId) =>
                normalizedItems.some((item) => item.product.id === productId)
              )
            );
          } catch {
            setSelectedProductIds(normalizedItems.map((item) => item.product.id));
          }
        } else {
          setSelectedProductIds(normalizedItems.map((item) => item.product.id));
        }
      } catch {
        setCartItems([]);
        setSelectedProductIds([]);
      }
    } else {
      setSelectedProductIds([]);
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    localStorage.setItem("ckkorea-cart", JSON.stringify(cartItems));
  }, [cartItems, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    localStorage.setItem("ckkorea-cart-selection", JSON.stringify(selectedProductIds));
  }, [hydrated, selectedProductIds]);

  useEffect(() => {
    const currentIds = cartItems.map((item) => item.product.id);

    setSelectedProductIds((prev) =>
      prev.filter((productId) => currentIds.includes(productId))
    );
  }, [cartItems]);

  const addToCart = (product: Product, quantity = 1) => {
    const minimumQuantity = Math.max(product.minimumOrderQuantity ?? 1, 1);

    if (
      product.price === null ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      product.stockQuantity === 0
    ) {
      return;
    }

    setSelectedProductIds((current) =>
      current.includes(product.id) ? current : [...current, product.id]
    );

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const maxQuantity =
        typeof product.stockQuantity === "number" ? product.stockQuantity : Number.POSITIVE_INFINITY;

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  Math.max(item.quantity + quantity, minimumQuantity),
                  maxQuantity
                ),
              }
            : item
        );
      }

      return [
        ...prev,
        {
          product,
          quantity: Math.min(Math.max(quantity, minimumQuantity), maxQuantity),
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const increaseQuantity = (productId: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity:
                typeof item.product.stockQuantity === "number"
                  ? Math.min(
                      Math.max(item.quantity + 1, item.product.minimumOrderQuantity ?? 1),
                      item.product.stockQuantity
                    )
                  : Math.max(item.quantity + 1, item.product.minimumOrderQuantity ?? 1),
            }
          : item
      )
    );
  };

  const decreaseQuantity = (productId: string) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) {
            return item;
          }

          const minimumQuantity = Math.max(item.product.minimumOrderQuantity ?? 1, 1);

          if (item.quantity <= minimumQuantity) {
            return null;
          }

          return {
            ...item,
            quantity: Math.max(minimumQuantity, item.quantity - 1),
          };
        })
        .filter((item): item is CartItem => Boolean(item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedProductIds([]);
  };

  const toggleCartItemSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllCartItems = () => {
    setSelectedProductIds(cartItems.map((item) => item.product.id));
  };

  const clearCartSelection = () => {
    setSelectedProductIds([]);
  };

  const selectedCartItems = useMemo(
    () => cartItems.filter((item) => selectedProductIds.includes(item.product.id)),
    [cartItems, selectedProductIds]
  );

  const totalCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.product.price ?? 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  const selectedTotalCount = useMemo(
    () => selectedCartItems.reduce((sum, item) => sum + item.quantity, 0),
    [selectedCartItems]
  );

  const selectedTotalPrice = useMemo(
    () =>
      selectedCartItems.reduce(
        (sum, item) => sum + (item.product.price ?? 0) * item.quantity,
        0
      ),
    [selectedCartItems]
  );

  const value: CartContextType = {
    cartItems,
    selectedProductIds,
    selectedCartItems,
    totalCount,
    totalPrice,
    selectedTotalCount,
    selectedTotalPrice,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    toggleCartItemSelection,
    selectAllCartItems,
    clearCartSelection,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
