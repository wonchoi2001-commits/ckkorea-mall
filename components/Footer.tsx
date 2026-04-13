import { companyInfo } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-4 gap-6 px-6 py-10 text-sm text-slate-600">
        <div>
          <div className="text-base font-black text-slate-900">회사 정보</div>
          <div className="mt-3 space-y-2">
            <div>상호명: {companyInfo.companyName}</div>
            <div>대표자: {companyInfo.ceo}</div>
            <div>사업자등록번호: {companyInfo.businessNumber}</div>
            <div>통신판매업 신고번호: {companyInfo.ecommerceNumber}</div>
          </div>
        </div>
        <div>
          <div className="text-base font-black text-slate-900">고객센터</div>
          <div className="mt-3 space-y-2">
            <div>전화: {companyInfo.phone}</div>
            <div>이메일: {companyInfo.email}</div>
            <div>{companyInfo.hours}</div>
          </div>
        </div>
        <div>
          <div className="text-base font-black text-slate-900">오시는 길</div>
          <div className="mt-3 space-y-2">
            <div>{companyInfo.address}</div>
            <div>매장 픽업 가능</div>
            <div>주차 가능</div>
          </div>
        </div>
        <div>
          <div className="text-base font-black text-slate-900">운영 채널</div>
          <div className="mt-3 space-y-2">
            <div>{companyInfo.kakaoLabel}</div>
            <div>도메인: www.ckkorea.co.kr</div>
            <div>B2B 견적문의 상시 접수</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
