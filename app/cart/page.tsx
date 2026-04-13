"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, addItem, decreaseItem, removeItem, clearCart } = useCart();

  const totalPrice = items.reduce((sum, item) => {
    return sum + (item.price ?? 0) * item.quantity;
  }, 0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <h1 className="text-3xl font-black">장바구니</h1>
          <p className="mt-2 text-sm text-slate-500">
            담아둔 상품을 확인하고 수량을 조정하세요.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {items.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">
              장바구니가 비어 있습니다
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              필요한 상품을 먼저 담아보세요.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              상품 보러가기
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.5fr_0.7fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.slug}
                  className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {item.category}
                        </span>
                        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                          {item.shipping}
                        </span>
                      </div>

                      <div className="text-lg font-bold text-slate-900">
                        {item.name}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {item.spec} · {item.unit}
                      </div>
                      <div className="mt-3 text-sm font-semibold text-slate-900">
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <div className="flex items-center rounded-2xl border border-slate-200">
                        <button
                          onClick={() => decreaseItem(item.slug)}
                          className="px-4 py-2 text-lg font-bold text-slate-700 hover:bg-slate-50"
                        >
                          -
                        </button>
                        <span className="min-w-12 px-4 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addItem(item)}
                          className="px-4 py-2 text-lg font-bold text-slate-700 hover:bg-slate-50"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-sm font-semibold text-slate-900">
                        소계: {formatPrice((item.price ?? 0) * item.quantity)}
                      </div>

                      <button
                        onClick={() => removeItem(item.slug)}
                        className="text-sm font-semibold text-rose-600 hover:text-rose-700"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-black">주문 요약</h2>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>상품 수</span>
                  <span>{items.length}개</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>총 수량</span>
                  <span>
                    {items.reduce((sum, item) => sum + item.quantity, 0)}개
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
                  <span>총 금액</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href="/quote"
                  className="block rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
                >
                  대량 견적 문의하기
                </Link>

                <button
                  onClick={clearCart}
                  className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  장바구니 비우기
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}