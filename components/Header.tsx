"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function Header() {
  const { totalCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black tracking-tight text-slate-900">
            씨케이코리아
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              홈
            </Link>
            <Link href="/products" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              상품
            </Link>
            <Link href="/quote" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              견적문의
            </Link>
            <Link href="/cart" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              장바구니
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/quote"
            className="hidden rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 md:inline-flex"
          >
            대량 견적문의
          </Link>

          <Link
            href="/cart"
            className="relative rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            장바구니
            {totalCount > 0 && (
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-900">
                {totalCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}