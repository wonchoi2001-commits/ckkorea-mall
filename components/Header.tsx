"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function Header() {
  const { totalCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="block">
          <div className="text-2xl font-black tracking-tight text-slate-900">
            주식회사 씨케이코리아
          </div>
          <div className="text-sm text-slate-500">건축자재 도소매 온라인 쇼핑몰</div>
        </Link>

        <nav className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <Link
            href="/products"
            className="rounded-xl px-3 py-2 transition hover:bg-slate-100"
          >
            상품목록
          </Link>

          <Link
            href="/quote"
            className="rounded-xl px-3 py-2 transition hover:bg-slate-100"
          >
            대량 견적문의
          </Link>

          <Link
            href="/cart"
            className="relative rounded-xl px-3 py-2 transition hover:bg-slate-100"
          >
            장바구니
            {totalCount > 0 && (
              <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-slate-900 px-2 py-0.5 text-xs font-bold text-white">
                {totalCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}