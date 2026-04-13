import Link from "next/link";
import { companyInfo } from "@/lib/data";

export default function Header() {
  return (
    <>
      <div className="border-b bg-slate-900 text-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-sm">
          <div className="flex items-center gap-6">
            <span>현장 납품 가능</span>
            <span>거래처 전용 단가 운영</span>
          </div>
          <div className="flex items-center gap-5">
            <span>{companyInfo.hours}</span>
            <span>{companyInfo.phone}</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="block">
            <div className="text-2xl font-black tracking-tight">{companyInfo.companyName}</div>
            <div className="text-sm text-slate-500">건축자재 도소매 온라인 쇼핑몰</div>
          </Link>

          <nav className="flex items-center gap-8 text-sm font-medium">
            <Link href="/products" className="text-slate-600 hover:text-slate-900">상품목록</Link>
            <Link href="/quote" className="text-slate-600 hover:text-slate-900">대량 견적문의</Link>
          </nav>
        </div>
      </header>
    </>
  );
}
