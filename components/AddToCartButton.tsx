"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { Product } from "@/lib/types";

export default function AddToCartButton({
  product,
  quantity = 1,
  fullWidth = false,
  variant = "primary",
}: {
  product: Product;
  quantity?: number;
  fullWidth?: boolean;
  variant?: "primary" | "secondary";
}) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const isSoldOut = product.stockQuantity === 0;

  if (product.price === null || isSoldOut) {
    return null;
  }

  const className =
    variant === "secondary"
      ? "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
      : "bg-slate-900 text-white hover:bg-slate-800";

  return (
    <button
      onClick={() => {
        addToCart(product, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${className} ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {added ? "장바구니에 담았어요" : quantity > 1 ? `${quantity}개 장바구니 담기` : "장바구니 담기"}
    </button>
  );
}
