import "./globals.css";
import type { Metadata } from "next";
import { CartProvider } from "@/components/CartProvider";

export const metadata: Metadata = {
  title: "씨케이코리아",
  description: "건축자재 도소매 온라인몰",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}