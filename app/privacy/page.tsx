import type { Metadata } from "next";
import InfoPageLayout from "@/components/InfoPageLayout";
import { companyInfo } from "@/lib/data";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${companyInfo.companyName} 개인정보처리방침 안내`,
};

export default function PrivacyPage() {
  return (
    <InfoPageLayout
      eyebrow="PRIVACY POLICY"
      title="개인정보처리방침"
      description="씨케이코리아는 견적문의, 주문, 고객 상담 과정에서 필요한 최소한의 개인정보만 수집하며, 관련 법령에 따라 안전하게 관리합니다."
    >
      <div className="space-y-8 text-sm leading-7 text-slate-600">
        <section>
          <h2 className="text-xl font-bold text-slate-900">1. 수집 항목</h2>
          <p className="mt-3">
            주문 및 견적문의 과정에서 이름, 연락처, 이메일, 회사명, 배송지, 문의내용,
            결제 및 주문 관련 정보가 수집될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">2. 이용 목적</h2>
          <p className="mt-3">
            수집한 정보는 상품 주문 처리, 배송, 견적 회신, 고객 상담, 거래 이력 관리,
            법령상 의무 이행을 위해 사용합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">3. 보유 및 파기</h2>
          <p className="mt-3">
            관계 법령에서 정한 보관 기간 동안 정보를 보관하며, 목적이 달성된 후에는
            지체 없이 파기합니다. 단, 세무 및 전자상거래 관련 법령상 보관 의무가 있는
            경우 해당 기간 동안 별도 보관합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">4. 제3자 제공 및 위탁</h2>
          <p className="mt-3">
            배송, 결제, 상담 회신 등 서비스 제공에 필요한 범위에서 결제사, 택배사,
            클라우드 인프라 사업자에게 정보 처리가 위탁될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">5. 문의처</h2>
          <p className="mt-3">
            개인정보 관련 문의는 {companyInfo.email}, {companyInfo.phone}로
            접수해주시면 확인 후 안내드립니다.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
}
