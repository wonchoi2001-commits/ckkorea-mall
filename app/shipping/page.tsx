import type { Metadata } from "next";
import InfoPageLayout from "@/components/InfoPageLayout";
import { companyInfo, shippingPolicy } from "@/lib/data";

export const metadata: Metadata = {
  title: "배송 안내",
  description: `${companyInfo.companyName} 배송 정책 및 출고 안내`,
};

export default function ShippingPage() {
  return (
    <InfoPageLayout
      eyebrow="SHIPPING GUIDE"
      title="배송 안내"
      description="일반 택배, 화물배송, 현장납품 문의까지 건축자재 특성에 맞는 배송 기준을 안내합니다."
    >
      <div className="space-y-8 text-sm leading-7 text-slate-600">
        <section>
          <h2 className="text-xl font-bold text-slate-900">1. 기본 배송비</h2>
          <p className="mt-3">
            기본 배송비는 {shippingPolicy.baseFee.toLocaleString()}원이며, 주문 금액{" "}
            {shippingPolicy.freeShippingThreshold.toLocaleString()}원 이상은 무료배송
            기준으로 적용합니다. 단, 상품 특성에 따라 예외가 있을 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">2. 화물배송 및 현장납품</h2>
          <p className="mt-3">{shippingPolicy.freightNotice}</p>
          <p className="mt-3">
            지역, 하차 조건, 상차 가능 여부, 운송 거리 등에 따라 별도 운임이 산정될 수
            있으며, 견적문의 또는 상담 후 확정됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">3. 출고 일정</h2>
          <p className="mt-3">
            일반 재고 상품은 영업일 기준 순차 출고되며, 주문 제작품이나 대량 발주 건은
            재고 확보 및 일정 조율 후 별도 안내드립니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">4. 문의 안내</h2>
          <p className="mt-3">
            긴급 납품, 반복 구매, 현장 진입 조건이 있는 배송은 주문 전{" "}
            {companyInfo.phone} 또는 견적문의로 상담해주시면 더 정확하게 안내받을 수
            있습니다.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
}
