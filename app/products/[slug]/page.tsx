import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import FavoriteButton from "@/components/FavoriteButton";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductImage from "@/components/ProductImage";
import ViewedProductTracker from "@/components/ViewedProductTracker";
import InfoGrid from "@/components/ui/InfoGrid";
import ProductBadge from "@/components/ui/ProductBadge";
import SectionHeader from "@/components/ui/SectionHeader";
import { companyInfo, shippingPolicy } from "@/lib/data";
import {
  getCatalogProductBySlug,
  getFeaturedProducts,
  getRelatedProducts,
  normalizeProductSlug,
} from "@/lib/products";
import { formatPrice } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(normalizeProductSlug(slug));

  if (!product) {
    return {
      title: `상품을 찾을 수 없습니다 | ${companyInfo.companyName}`,
    };
  }

  const title =
    product.metaTitle || `${product.name} | ${product.categoryMain} | ${companyInfo.companyName}`;
  const description =
    product.metaDescription ||
    product.shortDesc ||
    `${product.categoryMain} 카테고리의 ${product.name} 상품입니다. ${product.spec} 규격과 배송 방식, 구매 정보를 확인하세요.`;
  const canonical = `${companyInfo.domain}/products/${encodeURIComponent(product.slug)}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(normalizeProductSlug(slug));

  if (!product) {
    notFound();
  }

  const [relatedProducts, featuredProducts] = await Promise.all([
    getRelatedProducts(product, 4),
    getFeaturedProducts(8),
  ]);

  const recommendedProducts = featuredProducts
    .filter((item) => item.id !== product.id && !relatedProducts.some((related) => related.id === item.id))
    .slice(0, 4);
  const quoteHref = `/quote?product=${encodeURIComponent(product.slug)}`;
  const comparePrice =
    typeof product.salePrice === "number" && product.price !== null && product.salePrice > product.price
      ? product.salePrice
      : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: companyInfo.domain },
      {
        "@type": "ListItem",
        position: 2,
        name: "상품목록",
        item: `${companyInfo.domain}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${companyInfo.domain}/products/${encodeURIComponent(product.slug)}`,
      },
    ],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.metaDescription || product.description,
    image: [product.image],
    brand: { "@type": "Brand", name: product.brand },
    category: product.categoryMain,
    sku: product.slug,
    offers:
      product.price !== null
        ? {
            "@type": "Offer",
            priceCurrency: "KRW",
            price: product.price,
            availability:
              product.stockQuantity === 0
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            url: `${companyInfo.domain}/products/${encodeURIComponent(product.slug)}`,
          }
        : undefined,
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] text-slate-950">
      <Header />
      <ViewedProductTracker productId={product.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, productSchema]),
        }}
      />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-950">
            홈
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-slate-950">
            상품목록
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${encodeURIComponent(product.categoryMain)}`}
            className="hover:text-slate-950"
          >
            {product.categoryMain}
          </Link>
          <span>/</span>
          <span className="text-slate-700">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-slate-100 via-white to-slate-200">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-bold text-slate-950">상품 핵심 요약</div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{product.description}</p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-bold text-slate-950">구매/배송 가이드</div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {product.quoteRequired
                    ? "운임이나 납품지 조건에 따라 견적으로 확정되는 상품입니다. 현장명, 수량, 납품지와 함께 문의를 남겨주시면 빠르게 안내드립니다."
                    : "즉시결제 가능한 상품이며, 대량 수량 또는 사업자 거래는 견적문의로 전환해 별도 단가와 납기를 확인할 수 있습니다."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[36px] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <ProductBadge label={product.categoryMain} tone="slate" />
              {product.categorySub && product.categorySub !== product.categoryMain ? (
                <ProductBadge label={product.categorySub} tone="blue" />
              ) : null}
              {product.badge ? (
                <ProductBadge label={product.badge} tone={product.badgeTone ?? "blue"} />
              ) : null}
              {product.featured ? <ProductBadge label="추천 상품" tone="blue" /> : null}
              {product.quoteRequired ? (
                <ProductBadge label="견적형" tone="amber" />
              ) : (
                <ProductBadge label="즉시결제" tone="emerald" />
              )}
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-950">
              {product.name}
            </h1>
            <div className="mt-3 text-sm leading-6 text-slate-500">
              {[product.brand, product.manufacturer, product.origin].filter(Boolean).join(" · ")}
            </div>

            <div className="mt-7 rounded-[28px] bg-slate-950 p-6 text-white">
              {comparePrice ? (
                <div className="text-sm font-semibold text-slate-400 line-through">
                  정상가 {formatPrice(comparePrice)}
                </div>
              ) : null}
              <div className="mt-2 text-4xl font-black tracking-tight">
                {formatPrice(product.price)}
              </div>
              <div className="mt-2 text-sm text-slate-300">
                {product.quoteRequired
                  ? "현장 수량, 운임, 납품 일정 기준 견적으로 확정됩니다."
                  : "즉시결제 가능 품목이며 사업자·반복 발주도 대응합니다."}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    최소 주문
                  </div>
                  <div className="mt-2 text-lg font-bold">
                    {product.minimumOrderQuantity.toLocaleString()}개
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    재고 / 상태
                  </div>
                  <div className="mt-2 text-lg font-bold">{product.stock}</div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={`${product.id}-${tag}`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-bold text-slate-950">상품 설명</div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{product.description}</p>
            </div>

            <ProductDetailActions product={product} />

            <div className="mt-4 flex flex-wrap gap-3">
              <FavoriteButton productId={product.id} />
              <Link
                href={quoteHref}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-50"
              >
                견적문의 / 대량구매
              </Link>
              <button
                type="button"
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-500"
              >
                공유 기능 준비중
              </button>
            </div>
          </div>
        </div>

        <section className="mt-10">
          <InfoGrid
            items={[
              { label: "대분류", value: product.categoryMain },
              { label: "세부 품목", value: product.categorySub || product.category },
              { label: "규격", value: product.spec },
              { label: "판매단위", value: product.unit },
              { label: "배송방식", value: product.shipping },
              { label: "재고상태", value: product.stock },
              {
                label: "브랜드 / 제조사",
                value: [product.brand, product.manufacturer].filter(Boolean).join(" / ") || "-",
              },
              {
                label: "원산지 / MOQ",
                value: `${product.origin || "문의"} / ${product.minimumOrderQuantity.toLocaleString()}개`,
              },
            ]}
            columns={4}
          />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-lg font-black tracking-tight text-slate-950">배송 안내</div>
            <div className="mt-3 text-sm leading-7 text-slate-600">
              기본 배송비는 {shippingPolicy.baseFee.toLocaleString()}원이며,{" "}
              {shippingPolicy.freeShippingThreshold.toLocaleString()}원 이상 주문은
              무료배송 기준으로 운영합니다. {shippingPolicy.freightNotice}
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-lg font-black tracking-tight text-slate-950">사업자 주문</div>
            <div className="mt-3 text-sm leading-7 text-slate-600">
              법인거래, 반복 발주, 세금계산서 요청이 필요한 경우 주문 단계 또는 견적문의
              단계에서 사업자 정보를 함께 남길 수 있습니다.
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-lg font-black tracking-tight text-slate-950">교환 / 상담</div>
            <div className="mt-3 text-sm leading-7 text-slate-600">
              규격 오류, 납기 확인, 대량구매 상담이 필요한 경우 견적문의로 접수해주시면
              더 정확하게 안내해드립니다.
            </div>
            <Link
              href={quoteHref}
              className="mt-4 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              견적문의 바로가기
            </Link>
          </div>
        </section>

        <section className="mt-10 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            eyebrow="Details"
            title="상세 안내"
            description="현장 적용 전 규격, 수량, 배송 방식, 사용 환경을 함께 확인해 주세요."
          />

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {product.detailSections.map((section) => (
              <div
                key={section.title}
                className="rounded-[28px] border border-slate-200 bg-slate-50 p-5"
              >
                <div className="text-lg font-black tracking-tight text-slate-950">
                  {section.title}
                </div>
                {section.content ? (
                  <p className="mt-3 text-sm leading-7 text-slate-600">{section.content}</p>
                ) : null}
                {section.bullets && section.bullets.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="mt-10">
            <SectionHeader
              eyebrow="Related"
              title="관련 상품"
              description="같은 카테고리, 유사 규격, 검색 키워드 기준으로 함께 보면 좋은 상품입니다."
            />

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}

        {recommendedProducts.length > 0 ? (
          <section className="mt-10">
            <SectionHeader
              eyebrow="Recommended"
              title="함께 보면 좋은 추천 상품"
              description="홈 추천 기준으로 운영 중인 상품 중 현재 상품과 함께 보기에 적합한 품목을 골랐습니다."
            />

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {recommendedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </section>

      <Footer />
    </main>
  );
}
