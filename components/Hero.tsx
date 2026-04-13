import Link from "next/link";
import { companyInfo, products } from "@/lib/data";

export default function Hero() {
  const instantCount = products.filter((p) => p.type === "즉시결제").length;
  const quoteCount = products.filter((p) => p.type === "견적문의").length;

  return (
    <section className="overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-800 to-slate-700 text-white">
      <div className="grid grid-cols-2 gap-8 p-10">
        <div>
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
            씨케이코리아 자사몰
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight">{companyInfo.heroTitle}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200">{companyInfo.heroSubtitle}</p>
          <div className="mt-6 flex gap-3">
            <Link href="/products" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900">
              상품 보기
            </Link>
            <Link href="/quote" className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold text-white">
              견적 요청
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "즉시결제 상품", value: `${instantCount}개` },
            { label: "견적문의 상품", value: `${quoteCount}개` },
            { label: "택배 + 화물 배송", value: "동시 운영" },
            { label: "B2B 거래처 문의", value: "상시 가능" },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-white/10 p-5 backdrop-blur-sm">
              <div className="text-sm text-slate-300">{item.label}</div>
              <div className="mt-2 text-2xl font-bold">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
