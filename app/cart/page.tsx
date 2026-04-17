"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartProvider";
import ProductImage from "@/components/ProductImage";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const {
    cartItems,
    selectedProductIds,
    selectedCartItems,
    totalPrice,
    totalCount,
    selectedTotalCount,
    selectedTotalPrice,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    toggleCartItemSelection,
    selectAllCartItems,
    clearCartSelection,
    clearCart,
  } = useCart();

  const allSelected = cartItems.length > 0 && selectedProductIds.length === cartItems.length;

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
              <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    선택한 상품만 주문으로 넘어갑니다
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    지금 고른 품목만 주문서에 간단 요약으로 넘어가고, 나머지는 장바구니에
                    그대로 유지됩니다.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={allSelected ? clearCartSelection : selectAllCartItems}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    {allSelected ? "전체 해제" : "전체 선택"}
                  </button>
                  <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    선택 {selectedCartItems.length}종 / {selectedTotalCount}개
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className={`rounded-3xl bg-white p-5 shadow-sm ring-1 transition ${
                      selectedProductIds.includes(item.product.id)
                        ? "ring-slate-900/20"
                        : "ring-slate-200"
                    }`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <label className="mt-2 flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(item.product.id)}
                            onChange={() => toggleCartItemSelection(item.product.id)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                        </label>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="relative block h-24 w-24 overflow-hidden rounded-2xl bg-slate-100"
                        >
                          <ProductImage
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </Link>

                        <div>
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="text-lg font-bold text-slate-900 hover:underline"
                          >
                            {item.product.name}
                          </Link>
                          <div className="mt-1 text-sm text-slate-500">
                            {item.product.brand} · {item.product.spec}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            단위: {item.product.unit} / 배송: {item.product.shipping}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">{item.product.stock}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            최소 주문수량 {item.product.minimumOrderQuantity.toLocaleString()}개
                          </div>
                          <div className="mt-3 text-lg font-black text-slate-900">
                            {formatPrice(item.product.price)}
                          </div>
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
                    <span>선택 상품 수량</span>
                    <span className="font-semibold text-slate-900">
                      {selectedTotalCount}개
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>선택 상품 종류</span>
                    <span className="font-semibold text-slate-900">
                      {selectedCartItems.length}종
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>배송 방식</span>
                    <span className="font-semibold text-slate-900">상품별 상이</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900">선택 합계</span>
                      <span className="text-2xl font-black text-slate-900">
                        {formatPrice(selectedTotalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <Link
                    href="/order?source=cart"
                    aria-disabled={selectedCartItems.length === 0}
                    className={`rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white ${
                      selectedCartItems.length === 0
                        ? "pointer-events-none bg-slate-300"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    선택 상품 주문 / 결제하기
                  </Link>

                  <Link
                    href="/products"
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    상품 더 담으러 가기
                  </Link>

                  <Link
                    href="/quote"
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 hover:bg-slate-50"
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

                <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  전체 장바구니는 그대로 유지되고, 선택한 품목만 주문서로 넘어갑니다.
                  반복 구매나 사업자 주문은 필요한 품목만 골라 빠르게 결제할 수 있습니다.
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-500">
                  전체 {cartItems.length}종 / {totalCount}개, 장바구니 총액 {formatPrice(totalPrice)}
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
