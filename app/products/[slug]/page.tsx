import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddToCartButton from "@/components/AddToCartButton";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">
            홈
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-slate-900">
            상품목록
          </Link>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="relative aspect-[4/3] w-full bg-slate-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-3 flex items-center gap-2">
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
            </div>

            <h1 className="text-3xl font-black text-slate-900">{product.name}</h1>
            <div className="mt-2 text-sm text-slate-500">{product.brand}</div>

            <div className="mt-6 text-3xl font-black text-slate-900">
              {formatPrice(product.price)}
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span className="font-semibold text-slate-500">카테고리</span>
                <span className="text-right font-semibold text-slate-900">{product.category}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span className="font-semibold text-slate-500">규격</span>
                <span className="text-right font-semibold text-slate-900">{product.spec}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span className="font-semibold text-slate-500">판매단위</span>
                <span className="text-right font-semibold text-slate-900">{product.unit}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span className="font-semibold text-slate-500">배송방식</span>
                <span className="text-right font-semibold text-slate-900">{product.shipping}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-slate-500">재고상태</span>
                <span className="text-right font-semibold text-slate-900">{product.stock}</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600">
              {product.desc}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {product.price === null ? (
                <Link
                  href="/quote"
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  견적문의 하러가기
                </Link>
              ) : (
                <>
                  <AddToCartButton product={product} />
                  <Link
                    href="/cart"
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    장바구니 보기
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="text-lg font-bold text-slate-900">배송 안내</div>
            <div className="mt-3 text-sm leading-7 text-slate-600">
              기본 배송 방식은 상품 특성에 따라 택배 또는 화물배송으로 진행됩니다.
              대형 자재 및 합판류는 현장 납품 가능 여부를 별도 확인 후 안내드립니다.
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="text-lg font-bold text-slate-900">주문 안내</div>
            <div className="mt-3 text-sm leading-7 text-slate-600">
              즉시결제 상품은 수량 확인 후 바로 주문 흐름으로 연결할 수 있고,
              대량구매 또는 규격 상담이 필요한 경우 견적문의를 이용하시면 더 정확합니다.
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="text-lg font-bold text-slate-900">대량 문의</div>
            <div className="mt-3 text-sm leading-7 text-slate-600">
              건설현장, 공사자재, 반복납품, 법인거래는 별도 단가와 납품일정 협의가 가능합니다.
            </div>
            <Link
              href="/quote"
              className="mt-4 inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              견적문의 바로가기
            </Link>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-10">
            <div className="mb-4">
              <h2 className="text-2xl font-black text-slate-900">관련 상품</h2>
              <p className="mt-1 text-sm text-slate-500">
                같은 카테고리의 다른 상품도 함께 확인해보세요.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.slug}`}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative h-52 w-full bg-slate-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>

                  <div className="p-5">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{item.spec}</div>
                    <div className="mt-3 text-sm font-semibold text-slate-900">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>

      <Footer />
    </main>
  );
}