"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";
import { useShopper } from "@/components/ShopperProvider";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function ProductDetailActions({ product }: { product: Product }) {
  const { isBusinessMember, businessApproved, isLoggedIn } = useShopper();
  const isSoldOut = product.stockQuantity === 0;
  const minimumQuantity = Math.max(product.minimumOrderQuantity ?? 1, 1);
  const maxQuantity =
    typeof product.stockQuantity === "number" && product.stockQuantity > 0
      ? product.stockQuantity
      : 999;
  const [quantity, setQuantity] = useState(minimumQuantity);

  const totalPrice = useMemo(() => {
    return (product.price ?? 0) * quantity;
  }, [product.price, quantity]);

  const quoteHref = `/quote?product=${encodeURIComponent(product.slug)}`;
  const orderHref = `/order?product=${product.slug}&quantity=${quantity}`;

  if (product.price === null) {
    return (
      <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <div className="text-sm font-bold text-amber-800">견적문의 전용 상품</div>
        <p className="mt-2 text-sm leading-6 text-amber-900">
          현장 수량, 납품지, 규격 옵션에 따라 견적이 달라지는 상품입니다. 문의를
          남겨주시면 빠르게 회신드리겠습니다.
        </p>
        <Link
          href={quoteHref}
          className="mt-4 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          견적문의 바로가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-500">주문 수량</div>
          <div className="mt-2 text-xs text-slate-500">
            {typeof product.stockQuantity === "number"
              ? `최소 ${minimumQuantity}개, 최대 ${product.stockQuantity}개까지 주문 가능합니다.`
              : `최소 ${minimumQuantity}개 기준이며 재고 확인 후 주문이 확정됩니다.`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.max(minimumQuantity, prev - 1))}
            className="h-11 w-11 rounded-2xl border border-slate-300 bg-white text-lg font-bold"
          >
            -
          </button>
          <div className="flex h-11 min-w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-900">
            {quantity}
          </div>
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.min(maxQuantity, prev + 1))}
            disabled={isSoldOut}
            className="h-11 w-11 rounded-2xl border border-slate-300 bg-white text-lg font-bold disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-white px-4 py-4">
        <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
          <span>예상 결제금액</span>
          <span className="text-2xl font-black text-slate-900">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
        {isBusinessMember ? (
          businessApproved ? (
            <>
              사업자회원으로 로그인되어 있어 재주문, 저장 배송지, 세금계산서 정보 활용이 더 빠릅니다. 대량 수량은 견적문의와 함께 진행하면 현장 조건까지 한 번에 정리할 수 있습니다.
            </>
          ) : (
            <>
              사업자회원 승인 대기 중입니다. 기본 주문은 가능하며, 대량구매와 세금계산서 대응은 승인 후 더 원활하게 이어집니다.
            </>
          )
        ) : isLoggedIn ? (
          <>로그인 상태라 배송지와 주문자 정보가 자동 반영됩니다. 반복 주문은 마이페이지에서 더 빠르게 진행할 수 있습니다.</>
        ) : (
          <>비회원도 바로 구매할 수 있지만, 로그인하면 배송지 저장과 재주문 기능으로 다음 주문이 훨씬 빨라집니다.</>
        )}
      </div>

      {isSoldOut ? (
        <div className="mt-4 rounded-2xl border border-slate-300 bg-slate-100 px-5 py-4 text-center text-sm font-semibold text-slate-500">
          품절된 상품입니다. 견적문의로 대체 입고 여부를 확인해보세요.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <AddToCartButton
            product={product}
            quantity={quantity}
            fullWidth
            variant="secondary"
          />
          <Link
            href={orderHref}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
          >
            {quantity}개 바로 구매
          </Link>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-3">
        <Link
          href="/cart"
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          장바구니 보기
        </Link>
        <Link
          href={quoteHref}
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          견적문의 / 대량구매
        </Link>
      </div>
    </div>
  );
}
