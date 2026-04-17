import type { Metadata } from "next";
import InfoPageLayout from "@/components/InfoPageLayout";
import { companyInfo } from "@/lib/data";

export const metadata: Metadata = {
  title: "교환/반품/환불 안내",
  description: `${companyInfo.companyName} 교환, 반품, 환불 정책 안내`,
};

export default function ReturnsPage() {
  return (
    <InfoPageLayout
      eyebrow="RETURNS AND REFUNDS"
      title="교환 / 반품 / 환불 안내"
      description="상품 특성상 규격, 파손 여부, 화물배송 여부에 따라 교환 및 반품 기준이 달라질 수 있으므로 아래 기준과 개별 안내를 함께 확인해주세요."
    >
      <div className="space-y-8 text-sm leading-7 text-slate-600">
        <section>
          <h2 className="text-xl font-bold text-slate-900">1. 단순 변심</h2>
          <p className="mt-3">
            단순 변심에 의한 교환 및 반품은 수령 후 7일 이내 접수 가능하며, 왕복
            배송비는 고객 부담입니다. 사용 흔적, 개봉, 재판매 불가 상태의 상품은 제한될
            수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">2. 오배송 / 파손 / 하자</h2>
          <p className="mt-3">
            오배송, 파손, 제품 하자의 경우 사진과 함께 접수해주시면 확인 후 교환 또는
            환불을 진행합니다. 상품 상태 확인을 위해 포장 상태를 포함한 사진이 필요할 수
            있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">3. 반품 제한 품목</h2>
          <p className="mt-3">
            절단/주문 제작 자재, 현장 맞춤 발주 품목, 대량 특주품, 사용 후 상품, 포장
            훼손으로 상품 가치가 저하된 경우 반품이 제한될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">4. 환불 처리</h2>
          <p className="mt-3">
            환불 승인 후 결제수단에 따라 영업일 기준 수일 내 환불 반영될 수 있습니다.
            화물배송 및 현장 납품 건은 운송료 정산 후 환불 금액이 확정될 수 있습니다.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
}
