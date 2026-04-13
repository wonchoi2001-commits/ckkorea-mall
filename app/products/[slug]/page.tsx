import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter(
      (item) => item.category === product.category && item.slug !== product.slug
    )
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6">
          <Link
            href="/products"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← 상품목록으로
          </Link>
        </div>

        <div className="grid gap-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:grid-cols-2">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-600">
                실제 판매 상품 기준 대표 이미지
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-600">
                규격/옵션은 상세정보 확인
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-600">
                대량 주문은 별도 문의 가능
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  product.price === null
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {product.type}
              </span>

              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                {product.shipping}
              </span>

              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                {product.category}
              </span>
            </div>

            <h1 className="text-3xl font-black">{product.name}</h1>
            <p className="mt-2 text-sm text-slate-500">브랜드: {product.brand}</p>

            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <div className="text-sm text-slate-500">판매가</div>
              <div className="mt-2 text-3xl font-black">
                {formatPrice(product.price)}
              </div>
              <div className="mt-2 text-sm text-slate-500">
                재고 상태: {product.stock}
              </div>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 p-5">
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span className="text-slate-500">카테고리</span>
                <span className="text-right font-medium">{product.category}</span>
              </div>

              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span className="text-slate-500">규격</span>
                <span className="text-right font-medium">{product.spec}</span>
              </div>

              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span className="text-slate-500">판매단위</span>
                <span className="text-right font-medium">{product.unit}</span>
              </div>

              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span className="text-slate-500">배송방식</span>
                <span className="text-right font-medium">{product.shipping}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">구매방식</span>
                <span className="text-right font-medium">{product.type}</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="text-sm font-bold text-slate-900">구매 안내</div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>• 옵션 및 수량에 따라 단가가 달라질 수 있습니다.</li>
                <li>• 대량 납품, 현장 배송, 화물 배송은 별도 문의가 가능합니다.</li>
                <li>• 재고 및 납기 일정은 주문 전 확인을 권장합니다.</li>
              </ul>
            </div>

            <div className="mt-8 flex gap-3">
              {product.price === null ? (
                <Link
                  href="/quote"
                  className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-center text-sm font-semibold text-white hover:bg-slate-800"
                >
                  견적문의 하러가기
                </Link>
              ) : (
                <>
                  <button className="flex-1 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                    장바구니 담기
                  </button>
                  <Link
                    href="/quote"
                    className="flex-1 rounded-2xl bg-slate-900 px-5 py-4 text-center text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    대량 견적문의
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-black">상품 설명</h2>
            <p className="mt-4 leading-7 text-slate-600">{product.desc}</p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <div className="text-sm font-bold text-slate-900">추가 안내</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                현장 상황과 시공 방식에 따라 필요한 규격과 수량이 달라질 수 있으므로,
                반복 구매 품목이거나 대량 발주 건은 견적 문의를 통해 정확한 조건을
                확인하시는 것을 권장합니다.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-black">배송 / 교환 / 반품 안내</h2>

            <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
              <div>
                <div className="font-bold text-slate-900">배송 안내</div>
                <p className="mt-1">
                  일반 택배 상품은 결제 확인 후 순차 출고되며, 화물배송 상품은 지역과
                  수량에 따라 별도 일정이 안내됩니다.
                </p>
              </div>

              <div>
                <div className="font-bold text-slate-900">교환 / 반품 안내</div>
                <p className="mt-1">
                  상품 하자 또는 오배송의 경우 확인 후 교환 및 반품이 가능하며,
                  단순 변심에 의한 교환/반품은 상품 상태와 출고 조건에 따라 제한될 수
                  있습니다.
                </p>
              </div>

              <div>
                <div className="font-bold text-slate-900">대량 발주 안내</div>
                <p className="mt-1">
                  공사 현장 납품, 반복 발주, 사업자 대량 구매 건은 별도 견적과 배송 조건
                  협의가 가능합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-black">관련 상품</h2>
                <p className="mt-1 text-sm text-slate-500">
                  같은 카테고리의 다른 상품도 함께 확인해보세요.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}