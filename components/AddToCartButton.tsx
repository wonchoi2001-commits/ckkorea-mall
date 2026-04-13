"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { useCart } from "@/components/CartProvider";

export default function AddToCartButton({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const { addToCart } = useCart();
  const [done, setDone] = useState(false);

  return (
    <button
      onClick={() => {
        addToCart(product);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className={className}
    >
      {done ? "담기 완료" : "장바구니 담기"}
    </button>
  );
}