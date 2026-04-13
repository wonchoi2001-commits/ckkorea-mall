"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { useCart } from "@/components/CartProvider";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem(product);
    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        added
          ? "bg-emerald-600 text-white"
          : "bg-slate-900 text-white hover:bg-slate-800"
      }`}
    >
      {added ? "담기 완료" : "장바구니 담기"}
    </button>
  );
}