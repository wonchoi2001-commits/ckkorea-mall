import Link from "next/link";
import {
  catalogCategories,
  companyInfo,
  legalLinks,
  shippingPolicy,
} from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.9fr]">
          <div>
            <div className="text-2xl font-black tracking-tight">{companyInfo.companyName}</div>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              건축자재, 철물, 공구, 전기자재, 안전용품을 온라인으로 확인하고 주문할 수
              있는 씨케이코리아 자사몰입니다. 대량 발주와 현장 납품 건은 견적문의로
              빠르게 상담받으실 수 있습니다.
            </p>
            <div className="mt-5 rounded-[26px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
              기본 배송비 {shippingPolicy.baseFee.toLocaleString()}원,{" "}
              {shippingPolicy.freeShippingThreshold.toLocaleString()}원 이상 무료배송
              기준으로 운영하며, 화물배송/현장납품 품목은 별도 협의 후 진행합니다.
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-white">카테고리</div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {catalogCategories.slice(0, 6).map((category) => (
                <div key={category.name}>
                  <Link href={category.href} className="hover:text-white">
                    {category.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-white">운영 링크</div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div>
                <Link href="/" className="hover:text-white">
                  홈
                </Link>
              </div>
              <div>
                <Link href="/about" className="hover:text-white">
                  회사소개
                </Link>
              </div>
              <div>
                <Link href="/products" className="hover:text-white">
                  상품목록
                </Link>
              </div>
              <div>
                <Link href="/business-benefits" className="hover:text-white">
                  사업자회원 혜택
                </Link>
              </div>
              <div>
                <Link href="/quote" className="hover:text-white">
                  견적문의
                </Link>
              </div>
              <div>
                <Link href="/shipping" className="hover:text-white">
                  배송안내
                </Link>
              </div>
              {legalLinks.map((link) => (
                <div key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-white">회사 정보</div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <div>대표자: {companyInfo.ceo}</div>
              <div>사업자등록번호: {companyInfo.businessNumber}</div>
              <div>통신판매업 신고번호: {companyInfo.ecommerceNumber}</div>
              <div>전화: {companyInfo.phone}</div>
              <div>이메일: {companyInfo.email}</div>
              <div>주소: {companyInfo.address}</div>
              <div>운영시간: {companyInfo.hours}</div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} {companyInfo.companyName}. All rights reserved.</div>
          <div>사업자 거래 / 현장 납품 / 반복 발주 상담 가능</div>
        </div>
      </div>
    </footer>
  );
}
