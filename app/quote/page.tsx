import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteForm from "@/components/QuoteForm";
import { companyInfo } from "@/lib/data";

export default function QuotePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-7xl px-6 pt-10 pb-8">
        <div className="rounded-[32px] bg-slate-900 px-8 py-10 text-white">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              B2B / 현장 납품 / 대량 구매 상담
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight">
              대량 발주와 현장 납품은
              <br />
              견적문의로 더 빠르게 진행하세요
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-300">
              반복 구매 품목, 공사 현장 납품, 화물 배송, 규격 문의 등 일반 결제로
              처리하기 어려운 주문은 견적문의로 접수해주시면 조건에 맞게 빠르게
              안내해드립니다.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-2xl font-black">견적문의 작성</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                필요한 상품명, 규격, 수량, 납품 조건을 남겨주시면 더 정확한 견적
                안내가 가능합니다.
              </p>

              <div className="mt-6">
                <QuoteForm />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xl font-black">빠른 상담이 가능한 문의 예시</h3>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  “산업용 실리콘 300ml 백색 50개, 창원 지역 납품 가능 여부 문의”
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  “합판 1220x2440 12T 30장, 현장 하차 조건 포함 견적 요청”
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  “앙카 볼트 세트 M10 대량 구매 단가 문의”
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xl font-black">견적 진행 절차</h3>
              <div className="mt-5 space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    1
                  </div>
                  <div>
                    <div className="font-bold">문의 접수</div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      상품명, 수량, 납품 조건, 일정 등을 남겨주세요.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    2
                  </div>
                  <div>
                    <div className="font-bold">조건 확인</div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      재고, 운임, 납기, 규격 여부를 확인합니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    3
                  </div>
                  <div>
                    <div className="font-bold">견적 안내</div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      확인된 조건 기준으로 견적을 안내드립니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xl font-black">상담 안내</h3>

              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                  <span>상호명</span>
                  <span className="text-right font-semibold text-slate-900">
                    {companyInfo.companyName}
                  </span>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                  <span>대표번호</span>
                  <span className="text-right font-semibold text-slate-900">
                    {companyInfo.phone}
                  </span>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                  <span>이메일</span>
                  <span className="text-right font-semibold text-slate-900">
                    {companyInfo.email}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>운영시간</span>
                  <span className="text-right font-semibold text-slate-900">
                    {companyInfo.hours}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-slate-600">
                대량 발주, 반복 구매 품목, 화물배송, 현장 납품 건은 일반 상품 주문보다
                견적문의가 더 정확하고 빠릅니다.
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}