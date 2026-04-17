"use client";

import { useEffect } from "react";
import { useShopper } from "@/components/ShopperProvider";

export default function ViewedProductTracker({ productId }: { productId: string }) {
  const { recordRecentlyViewed } = useShopper();

  useEffect(() => {
    void recordRecentlyViewed(productId);
    // productId 기준으로만 최근 본 상품을 기록합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return null;
}
