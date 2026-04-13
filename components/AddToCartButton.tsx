"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  if (product.price === null) {
    return null;
  }

  return (
    <button
      onClick={() => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
    >
      {added ? "담기 완료" : "장바구니 담기"}
    </button>
  );
}