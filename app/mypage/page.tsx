import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MyPageDashboard from "@/components/member/MyPageDashboard";
import { companyInfo } from "@/lib/data";
import { requireSignedInUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: `마이페이지 | ${companyInfo.companyName}`,
  description:
    "내 정보, 저장 배송지, 관심상품, 최근 본 상품, 주문 내역, 재주문, 사업자회원 정보를 관리할 수 있습니다.",
  alternates: {
    canonical: `${companyInfo.domain}/mypage`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MyPage() {
  const user = await requireSignedInUser("/login?redirect=%2Fmypage");

  if (!user) {
    redirect("/login?redirect=%2Fmypage");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-10">
        <MyPageDashboard />
      </section>
      <Footer />
    </main>
  );
}
