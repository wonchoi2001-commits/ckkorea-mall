import type { Metadata } from "next";
import InfoPageLayout from "@/components/InfoPageLayout";
import { companyInfo } from "@/lib/data";

export const metadata: Metadata = {
  title: "이용약관",
  description: `${companyInfo.companyName} 쇼핑몰 이용약관 안내`,
};

export default function TermsPage() {
  return (
    <InfoPageLayout
      eyebrow="TERMS OF USE"
      title="이용약관"
      description="씨케이코리아 자사몰 이용과 관련된 기본 조건, 주문 및 계약 성립, 결제, 취소, 책임 범위를 안내합니다."
    >
      <div className="space-y-8 text-sm leading-7 text-slate-600">
        <section>
          <h2 className="text-xl font-bold text-slate-900">1. 서비스 범위</h2>
          <p className="mt-3">
            본 쇼핑몰은 건축자재, 철물, 공구, 안전용품 등의 판매 및 견적 상담을 위한
            온라인 서비스를 제공합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">2. 주문 및 계약 성립</h2>
          <p className="mt-3">
            고객이 상품 주문 또는 결제를 완료하고 당사가 이를 확인한 시점에 계약이
            성립합니다. 재고 부족, 가격 오류, 배송 불가 지역 등 운영상 사유가 있는 경우
            주문이 제한되거나 취소될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">3. 결제 및 환불</h2>
          <p className="mt-3">
            결제는 당사가 제공하는 결제수단을 통해 진행되며, 취소 및 환불 기준은 관련
            법령과 별도 환불 안내 정책을 따릅니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">4. 회원 및 비회원 이용</h2>
          <p className="mt-3">
            현재 서비스는 비회원 주문 및 문의를 포함하며, 정확한 주문 처리와 회신을 위해
            연락 가능한 정보를 입력해야 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">5. 책임의 제한</h2>
          <p className="mt-3">
            천재지변, 운송사 사정, 현장 진입 제한 등 불가항력적인 사유로 배송 및 납기가
            지연될 수 있으며, 이 경우 개별 안내를 우선합니다.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
}
