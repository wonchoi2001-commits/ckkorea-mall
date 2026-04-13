"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalPrice,
    totalCount,
  } = useCart();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black">장바구니</h1>
            <p className="mt-2 text-sm text-slate-500">
              총 {totalCount}개의 상품이 담겨 있습니다.
            </p>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              전체 비우기
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
            <div className="text-2xl font-black">장바구니가 비어 있습니다.</div>
            <p className="mt-3 text-sm text-slate-500">
              필요한 상품을 담은 뒤 다시 확인해보세요.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              상품 보러가기
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.slug}
                  className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:grid-cols-[140px_1fr]"
                >
                  <div className="relative h-36 overflow-hidden rounded-2xl bg-slate-100">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>

                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="text-lg font-bold hover:text-slate-700"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-2 text-sm text-slate-500">
                          규격: {item.spec} / 단위: {item.unit}
                        </div>
                        <div className="mt-2 text-lg font-black">
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.slug)}
                        className="text-sm font-semibold text-slate-500 hover:text-slate-900"
                      >
                        삭제
                      </button>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decreaseQuantity(item.slug)}
                          className="h-10 w-10 rounded-xl border border-slate-300 bg-white text-lg font-bold hover:bg-slate-50"
                        >
                          -
                        </button>
                        <div className="min-w-[48px] text-center font-bold">
                          {item.quantity}
                        </div>
                        <button
                          onClick={() => increaseQuantity(item.slug)}
                          className="h-10 w-10 rounded-xl border border-slate-300 bg-white text-lg font-bold hover:bg-slate-50"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-slate-500">합계</div>
                        <div className="text-xl font-black">
                          {formatPrice((item.price ?? 0) * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="sticky top-24 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-black">주문 요약</h2>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between border-b border-slate-200 pb-3">
                    <span>상품 수</span>
                    <span className="font-semibold text-slate-900">{totalCount}개</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-3">
                    <span>상품 금액</span>
                    <span className="font-semibold text-slate-900">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>배송비</span>
                    <span className="font-semibold text-slate-900">별도 안내</span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">예상 결제금액</div>
                  <div className="mt-2 text-3xl font-black">
                    {formatPrice(totalPrice)}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white hover:bg-slate-800">
                    주문하기(준비중)
                  </button>
                  <Link
                    href="/quote"
                    className="block w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-center text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    대량 견적문의 하기
                  </Link>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  실제 배송비와 납기 일정은 상품 종류, 수량, 지역에 따라 달라질 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}