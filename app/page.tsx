import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  catalogCategories,
  companyInfo,
  companyHighlights,
  faqPreview,
  homeQuickActions,
  homeTrustPoints,
  shippingPolicy,
  supplyCategoryHighlights,
} from "@/lib/data";
import {
  getCatalogProducts,
  getFeaturedProducts,
  getNewestProducts,
  getPopularProducts,
} from "@/lib/products";

export const metadata: Metadata = {
  title: "건축자재·철물·공구 자사몰",
  description:
    "건축자재, 철물, 공구, PVC 배관 자재, 전기자재, 안전용품을 한 곳에서 확인하고 즉시결제 또는 견적문의로 연결할 수 있는 CKKOREA 자사몰입니다.",
  alternates: {
    canonical: companyInfo.domain,
  },
  openGraph: {
    title: `${companyInfo.companyName} | 건축자재·철물·공구 자사몰`,
    description:
      "현장 납품, 화물배송, 사업자 대량구매까지 대응하는 건축자재 전문 자사몰입니다.",
    url: companyInfo.domain,
  },
};

export default async function HomePage() {
  const [allProducts, featuredProducts, newestProducts, popularProducts] = await Promise.all([
    getCatalogProducts(),
    getFeaturedProducts(10),
    getNewestProducts(6),
    getPopularProducts(6),
  ]);

  const stats = {
    totalProducts: allProducts.length,
    instantProducts: allProducts.filter((product) => product.price !== null).length,
    quoteProducts: allProducts.filter((product) => product.quoteRequired).length,
    categoryCount: new Set(allProducts.map((product) => product.categoryMain)).size,
  };

  const categoryCards = catalogCategories.map((category) => {
    const items = allProducts.filter((product) => product.categoryMain === category.name);

    return {
      ...category,
      count: items.length,
      quoteCount: items.filter((product) => product.quoteRequired).length,
    };
  });

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: companyInfo.companyName,
    url: companyInfo.domain,
    telephone: companyInfo.phone,
    email: companyInfo.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: companyInfo.address,
      addressCountry: "KR",
    },
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f8fafc_35%,#ffffff_100%)] text-slate-950">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <section className="mx-auto max-w-7xl px-6 pt-10 pb-8">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="overflow-hidden rounded-[36px] bg-[radial-gradient(circle_at_top_left,#334155_0%,#0f172a_42%,#020617_100%)] px-8 py-9 text-white shadow-2xl shadow-slate-300/40">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              건축자재 · 철물 · 공구 · 전기자재 · 안전용품 운영형 자사몰
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.15] tracking-tight md:text-5xl">
              현장에 필요한 자재를
              <br />
              더 빠르고 정확하게
              <br />
              주문하는 씨케이코리아 자사몰
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              철물점, 건재상, 공구상에서 자주 취급하는 품목군을 카테고리형으로
              정리했습니다. 소량 구매는 즉시결제, 대량 발주와 현장 납품은 견적문의로
              자연스럽게 이어지는 운영형 구조입니다.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                상품 보러가기
              </Link>
              <Link
                href="/quote"
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                현장 견적 문의하기
              </Link>
              <Link
                href="/shipping"
                className="rounded-2xl border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                배송 안내 보기
              </Link>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  전체 상품
                </div>
                <div className="mt-2 text-3xl font-black">{stats.totalProducts}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  운영 카테고리
                </div>
                <div className="mt-2 text-3xl font-black">{stats.categoryCount}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  즉시결제
                </div>
                <div className="mt-2 text-3xl font-black">{stats.instantProducts}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  견적형
                </div>
                <div className="mt-2 text-3xl font-black">{stats.quoteProducts}</div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {companyHighlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                고객센터
              </div>
              <div className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                {companyInfo.phone}
              </div>
              <div className="mt-2 text-sm text-slate-500">{companyInfo.hours}</div>
              <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                반복 구매 품목, 사업자 주문, 현장 납품, 대구경 배관, 골재와 같은 중량
                자재는 견적문의로 더 빠르게 안내해드립니다.
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                빠른 시작
              </div>
              <div className="mt-4 space-y-4">
                {homeQuickActions.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-[24px] border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-900 hover:bg-white"
                  >
                    <div className="text-base font-bold text-slate-950">{item.title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                    <div className="mt-3 text-sm font-semibold text-slate-900">{item.label} →</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <SectionHeader
          eyebrow="Categories"
          title="자주 찾는 카테고리를 한눈에 확인하세요"
          description="철물·건재·배관·공구뿐 아니라 전기자재, 안전용품, 실리콘/접착제, 소모품까지 실제 매장형 구조로 정리했습니다."
          href="/products"
          hrefLabel="전체 카탈로그 보기"
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {categoryCards.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`relative h-40 bg-gradient-to-br ${category.accent}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
                <div className="absolute inset-0 flex items-end justify-between p-5 text-white">
                  <div>
                    <div className="text-xl font-black tracking-tight">{category.name}</div>
                    <div className="mt-1 text-sm text-white/80">{category.lead}</div>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold backdrop-blur">
                    {category.count}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm leading-6 text-slate-600">{category.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span>견적형 {category.quoteCount}개 포함</span>
                  <span>카테고리 보기 →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <SectionHeader
          eyebrow="Featured"
          title="홈 추천상품"
          description="관리자 추천값과 카테고리 분산 로직을 기준으로 홈에 우선 노출되는 상품입니다. 즉시결제 상품과 견적형 상품을 함께 보여줘 자재몰 특성이 드러나도록 구성했습니다."
          href="/products"
          hrefLabel="추천 기준으로 더 보기"
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 md:col-span-2 xl:col-span-5">
              아직 노출 중인 추천 상품이 없습니다. 관리자에서 상품 추천 여부를 설정하면 이
              영역에 자동 반영됩니다.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <SectionHeader
          eyebrow="Popular"
          title="현장 인기 품목"
          description="검색성, 카테고리 대표성, 품질 점수, 즉시결제 가능 여부를 함께 반영해 자주 먼저 확인할 만한 품목을 골랐습니다."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {popularProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <SectionHeader
          eyebrow="New In"
          title="최근 정리된 품목"
          description="신규 등록되었거나 최근 운영 구조에 맞게 정리된 품목입니다. 상세 설명과 카테고리 구조를 함께 보강해 상품 풀이 풍부하게 보이도록 구성했습니다."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {newestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-5 lg:grid-cols-3">
          {homeTrustPoints.map((point) => (
            <div
              key={point.title}
              className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-xl font-black tracking-tight text-slate-950">
                {point.title}
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{point.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              eyebrow="FAQ"
              title="운영 전에 자주 확인하는 안내"
              description="실제 자재몰 운영에서 자주 묻는 배송, 견적, 사업자 주문 관련 질문을 먼저 정리했습니다."
            />
            <div className="mt-6 space-y-4">
              {faqPreview.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="text-base font-bold text-slate-950">{faq.question}</div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-slate-950 px-8 py-8 text-white shadow-xl shadow-slate-300/40">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              Open-ready
            </div>
            <h2 className="mt-4 text-3xl font-black leading-tight">
              견적 문의와 즉시결제를 함께 운영하는
              <br />
              현장형 쇼핑몰 구조
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              기본 배송비 {shippingPolicy.baseFee.toLocaleString()}원,{" "}
              {shippingPolicy.freeShippingThreshold.toLocaleString()}원 이상 무료배송 기준을
              적용하고, 장척/중량 자재는 별도 상담 구조로 운영합니다.
            </p>
            <div className="mt-8 grid gap-3">
              <Link
                href="/quote"
                className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                견적문의 바로가기
              </Link>
              <Link
                href="/products"
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/20"
              >
                상품 전체 보기
              </Link>
            </div>
            <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
              전화 상담 {companyInfo.phone}
              <br />
              사업자 거래, 반복 발주, 현장 납품, 법인 주문 대응 가능
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <SectionHeader
            eyebrow="Supply Scope"
            title="씨케이코리아 취급 품목 범위"
            description="사이트에 보이는 품목 외에도 반복 발주 품목군을 계속 확장할 수 있도록 카테고리 중심 구조로 정리했습니다."
            href="/about"
            hrefLabel="회사 / 취급품목 보기"
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {supplyCategoryHighlights.map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
