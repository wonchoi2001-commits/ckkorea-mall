"use client";

import { useMemo } from "react";
import { useShopper } from "@/components/ShopperProvider";

export default function FavoriteButton({
  productId,
  className = "",
  compact = false,
}: {
  productId: string;
  className?: string;
  compact?: boolean;
}) {
  const { favoriteIds, toggleFavorite, isLoggedIn } = useShopper();
  const isFavorite = useMemo(() => favoriteIds.includes(productId), [favoriteIds, productId]);

  return (
    <button
      type="button"
      onClick={() => void toggleFavorite(productId)}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        isFavorite
          ? "border-rose-300 bg-rose-50 text-rose-700"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-950"
      } ${compact ? "px-3 py-2 text-xs" : ""} ${className}`}
      aria-pressed={isFavorite}
    >
      <span>{isFavorite ? "찜됨" : "관심상품"}</span>
      {!compact ? (
        <span className="text-[11px] font-medium text-slate-500">
          {isLoggedIn ? "회원 저장" : "브라우저 저장"}
        </span>
      ) : null}
    </button>
  );
}
