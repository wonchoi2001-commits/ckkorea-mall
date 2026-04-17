import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import FavoriteButton from "@/components/FavoriteButton";
import ProductImage from "@/components/ProductImage";
import ProductBadge from "@/components/ui/ProductBadge";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const isSoldOut = product.stockQuantity === 0;
  const quoteHref = `/quote?product=${encodeURIComponent(product.slug)}`;
  const comparePrice =
    typeof product.salePrice === "number" && product.price !== null && product.salePrice > product.price
      ? product.salePrice
      : null;

  return (
    <article className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200">
          <ProductImage
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-x-0 top-0 flex flex-wrap gap-2 p-4">
            <ProductBadge label={product.categoryMain} tone="slate" />
            {product.badge ? (
              <ProductBadge label={product.badge} tone={product.badgeTone ?? "blue"} />
            ) : null}
            {product.featured ? <ProductBadge label="추천" tone="blue" /> : null}
            {product.quoteRequired ? (
              <ProductBadge label="견적형" tone="amber" />
            ) : (
              <ProductBadge label="즉시결제" tone="emerald" />
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-slate-950/65 to-transparent p-4 text-white">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                {product.categorySub || product.categoryMain}
              </div>
              <div className="mt-1 text-sm font-semibold text-white/90">{product.shipping}</div>
            </div>
            <div className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              {product.stock}
            </div>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={`${product.id}-${tag}`}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>

        <Link href={`/products/${product.slug}`} className="mt-4 block">
          <h3 className="line-clamp-2 text-xl font-black leading-8 tracking-tight text-slate-950 group-hover:text-slate-700">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 text-sm font-medium text-slate-500">
          {[product.brand, product.manufacturer].filter(Boolean).join(" · ") || "브랜드 문의"}
        </div>

        <p className="mt-4 min-h-[72px] text-sm leading-6 text-slate-600">{product.shortDesc}</p>

        <div className="mt-4 grid gap-2 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
          <div className="flex items-center justify-between gap-4">
            <span>규격</span>
            <span className="font-semibold text-slate-900">{product.spec}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>판매단위</span>
            <span className="font-semibold text-slate-900">{product.unit}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>최소 주문</span>
            <span className="font-semibold text-slate-900">
              {product.minimumOrderQuantity.toLocaleString()}개
            </span>
          </div>
        </div>

        <div className="mt-5">
          {comparePrice ? (
            <div className="text-sm font-semibold text-slate-400 line-through">
              {formatPrice(comparePrice)}
            </div>
          ) : null}
          <div className="mt-1 text-3xl font-black tracking-tight text-slate-950">
            {formatPrice(product.price)}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500">
            {product.quoteRequired
              ? "현장 수량, 운임, 납품 일정에 따라 견적으로 안내합니다."
              : "즉시결제 가능 품목이며 대량 구매는 별도 상담이 가능합니다."}
          </div>
        </div>

        {product.bulkyItem || product.quoteRequired ? (
          <div className="mt-4 rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium leading-5 text-amber-900">
            {product.bulkyItem
              ? "중량물 또는 장척물 성격이 있어 배송비와 하차 조건 확인이 필요할 수 있습니다."
              : "규격 확인, 반복 구매, 사업자 거래는 견적문의로 더 빠르게 안내할 수 있습니다."}
          </div>
        ) : null}

        <div className="mt-5 grid gap-2">
          {product.price === null ? (
            <>
              <Link
                href={`/products/${product.slug}`}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-50"
              >
                상세보기
              </Link>
              <Link
                href={quoteHref}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                견적문의
              </Link>
            </>
          ) : isSoldOut ? (
            <>
              <Link
                href={`/products/${product.slug}`}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-50"
              >
                상세보기
              </Link>
              <div className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-500">
                품절
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/products/${product.slug}`}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-50"
                >
                  상세보기
                </Link>
                <Link
                  href={`/order?product=${product.slug}&quantity=${product.minimumOrderQuantity}`}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  바로결제
                </Link>
              </div>
              <AddToCartButton
                product={product}
                quantity={product.minimumOrderQuantity}
                fullWidth
                variant="secondary"
              />
            </>
          )}
          <FavoriteButton productId={product.id} compact />
        </div>
      </div>
    </article>
  );
}
