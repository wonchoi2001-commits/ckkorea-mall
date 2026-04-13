import type { Metadata } from "next";
import "./globals.css";
import { companyInfo } from "@/lib/data";

export const metadata: Metadata = {
  title: companyInfo.metaTitle,
  description: companyInfo.metaDescription,
  alternates: {
    canonical: companyInfo.domain,
  },
  openGraph: {
    title: companyInfo.metaTitle,
    description: companyInfo.metaDescription,
    url: companyInfo.domain,
    siteName: companyInfo.companyName,
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
