import Link from "next/link";
import { companyInfo } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="text-xl font-black text-slate-900">{companyInfo.companyName}</div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              건축자재, 철물, 공구, 안전용품을 온라인으로 확인하고 주문할 수 있는
              씨케이코리아 자사몰입니다. 대량 발주와 현장 납품 건은 견적문의로
              빠르게 상담받으실 수 있습니다.
            </p>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-900">바로가기</div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div><Link href="/" className="hover:text-slate-900">홈</Link></div>
              <div><Link href="/products" className="hover:text-slate-900">상품목록</Link></div>
              <div><Link href="/quote" className="hover:text-slate-900">견적문의</Link></div>
              <div><Link href="/cart" className="hover:text-slate-900">장바구니</Link></div>
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-900">회사정보</div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <div>대표자: {companyInfo.ceo}</div>
              <div>사업자등록번호: {companyInfo.businessNumber}</div>
              <div>전화: {companyInfo.phone}</div>
              <div>이메일: {companyInfo.email}</div>
              <div>주소: {companyInfo.address}</div>
              <div>운영시간: {companyInfo.hours}</div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} {companyInfo.companyName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}