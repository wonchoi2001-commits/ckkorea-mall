import type { Metadata } from "next";
import ProductCatalog from "@/components/ProductCatalog";
import { companyInfo } from "@/lib/data";
import { getCatalogProducts } from "@/lib/products";

type Props = {
  searchParams?: Promise<{ category?: string; q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const category = resolvedSearchParams.category?.trim();
  const keyword = resolvedSearchParams.q?.trim();
  const title = category
    ? `${category} 상품목록`
    : keyword
      ? `${keyword} 검색 결과`
      : "상품목록";
  const description = category
    ? `${category} 카테고리 상품을 확인하세요. 규격, 배송 방식, 가격, 견적문의 여부를 한 번에 볼 수 있습니다.`
    : keyword
      ? `${keyword} 검색 결과입니다. 관련 건축자재, 철물, 공구 상품을 확인하세요.`
      : "철물, 건재, 골재, 목재, PVC 배관 및 부속, 공구, 전기자재, 안전용품, 접착제/실리콘, 소모품/부자재 상품을 카테고리와 검색으로 확인할 수 있습니다.";

  const query = new URLSearchParams();
  if (category) {
    query.set("category", category);
  }
  if (keyword) {
    query.set("q", keyword);
  }

  return {
    title,
    description,
    alternates: {
      canonical: query.size
        ? `${companyInfo.domain}/products?${query.toString()}`
        : `${companyInfo.domain}/products`,
    },
    openGraph: {
      title: `${title} | ${companyInfo.companyName}`,
      description,
      url: query.size
        ? `${companyInfo.domain}/products?${query.toString()}`
        : `${companyInfo.domain}/products`,
    },
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const products = await getCatalogProducts();

  return (
    <ProductCatalog
      products={products}
      initialCategory={resolvedSearchParams.category}
      initialKeyword={resolvedSearchParams.q}
    />
  );
}
