"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const {
    cartItems,
    totalPrice,
    totalCount,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black">장바구니</h1>
          <p className="mt-2 text-sm text-slate-500">
            담아둔 상품을 확인하고 수량을 조정할 수 있습니다.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
            <div className="text-xl font-bold text-slate-900">장바구니가 비어 있습니다.</div>
            <p className="mt-2 text-sm text-slate-500">
              상품목록에서 필요한 자재를 담아보세요.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              상품 보러가기
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-lg font-bold text-slate-900">
                          {item.product.name}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {item.product.brand} · {item.product.spec}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          단위: {item.product.unit}
                        </div>
                        <div className="mt-3 text-lg font-black text-slate-900">
                          {formatPrice(item.product.price)}
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 md:items-end">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decreaseQuantity(item.product.id)}
                            className="h-10 w-10 rounded-xl border border-slate-300 bg-white text-lg font-bold hover:bg-slate-50"
                          >
                            -
                          </button>
                          <div className="flex h-10 min-w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold">
                            {item.quantity}
                          </div>
                          <button
                            onClick={() => increaseQuantity(item.product.id)}
                            className="h-10 w-10 rounded-xl border border-slate-300 bg-white text-lg font-bold hover:bg-slate-50"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-sm font-semibold text-slate-900">
                          소계: {formatPrice((item.product.price ?? 0) * item.quantity)}
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-sm font-semibold text-red-600 hover:text-red-700"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="text-lg font-bold text-slate-900">주문 요약</div>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>총 상품 수량</span>
                    <span className="font-semibold text-slate-900">{totalCount}개</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>배송 방식</span>
                    <span className="font-semibold text-slate-900">상품별 상이</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900">총 합계</span>
                      <span className="text-2xl font-black text-slate-900">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <Link
                    href="/quote"
                    className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    대량 견적 문의하기
                  </Link>

                  <button
                    onClick={clearCart}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    장바구니 비우기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}