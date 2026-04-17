import "./globals.css";
import type { Metadata } from "next";
import { CartProvider } from "@/components/CartProvider";
import { ShopperProvider } from "@/components/ShopperProvider";
import { companyInfo } from "@/lib/data";
import { getMetadataBase } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: companyInfo.metaTitle,
    template: `%s | ${companyInfo.companyName}`,
  },
  description: companyInfo.metaDescription,
  applicationName: companyInfo.companyName,
  keywords: [
    "건축자재",
    "철물",
    "공구",
    "안전용품",
    "전기자재",
    "PVC 배관",
    "실리콘",
    "현장 납품",
    "화물배송",
    "자재몰",
    "씨케이코리아",
  ],
  openGraph: {
    title: companyInfo.metaTitle,
    description: companyInfo.metaDescription,
    url: companyInfo.domain,
    siteName: companyInfo.companyName,
    locale: "ko_KR",
    type: "website",
  },
  alternates: {
    canonical: companyInfo.domain,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900">
        <CartProvider>
          <ShopperProvider>{children}</ShopperProvider>
        </CartProvider>
      </body>
    </html>
  );
}
