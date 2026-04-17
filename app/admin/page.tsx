import Link from "next/link";
import AdminPanelHeader from "@/components/admin/AdminPanelHeader";
import { requireAdminUser } from "@/lib/auth";
import { getOrderRecords, isMissingOrdersTableError } from "@/lib/orders";
import { getCatalogCategories, getProductRecords } from "@/lib/products";
import {
  getQuoteRequestRecords,
  isMissingQuoteRequestsTableError,
} from "@/lib/quotes";

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(value?: number | null) {
  if (typeof value !== "number") {
    return "견적형";
  }

  return `${value.toLocaleString()}원`;
}

export default async function AdminDashboardPage() {
  const adminUser = await requireAdminUser();
  const products = await getProductRecords({ includeInactive: true });
  const categories = await getCatalogCategories();

  let orders = [] as Awaited<ReturnType<typeof getOrderRecords>>;
  let quotes = [] as Awaited<ReturnType<typeof getQuoteRequestRecords>>;
  let orderNotice = "";
  let quoteNotice = "";

  try {
    orders = await getOrderRecords();
  } catch (error) {
    console.error("ADMIN DASHBOARD ORDERS LOAD ERROR:", error);
    orderNotice = isMissingOrdersTableError(error)
      ? "orders 테이블이 아직 연결되지 않아 주문 통계는 비어 있습니다."
      : "주문 통계를 불러오는 중 오류가 발생했습니다.";
  }

  try {
    quotes = await getQuoteRequestRecords();
  } catch (error) {
    console.error("ADMIN DASHBOARD QUOTES LOAD ERROR:", error);
    quoteNotice = isMissingQuoteRequestsTableError(error)
      ? "quote_requests 테이블이 아직 연결되지 않아 견적 통계는 비어 있습니다."
      : "견적 통계를 불러오는 중 오류가 발생했습니다.";
  }

  const activeProducts = products.filter((product) => product.is_active !== false);
  const featuredProducts = products.filter((product) => product.featured === true);
  const quoteProducts = products.filter(
    (product) => product.quote_required === true || product.price === null
  );
  const paidOrders = orders.filter((order) => order.status === "DONE");
  const preparingOrders = orders.filter((order) =>
    ["PREPARING", "READY_TO_SHIP", "SHIPPED"].includes(order.fulfillment_status)
  );
  const newQuotes = quotes.filter((quote) => quote.status === "NEW");
  const reviewingQuotes = quotes.filter((quote) => quote.status === "IN_PROGRESS");
  const recentProducts = [...products]
    .sort((a, b) =>
      String(b.updated_at || b.created_at || "").localeCompare(
        String(a.updated_at || a.created_at || "")
      )
    )
    .slice(0, 6);
  const recentOrders = orders.slice(0, 5);
  const recentQuotes = quotes.slice(0, 5);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-10">
        <AdminPanelHeader
          title="운영 대시보드"
          description="상품, 주문, 견적문의 현황을 한 번에 보고 우선 처리할 작업을 빠르게 확인할 수 있습니다."
          adminEmail={adminUser.email ?? "관리자"}
          activeTab="dashboard"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">운영 상품</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {activeProducts.length}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              전체 {products.length}개 / 카테고리 {categories.length}개
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">추천·견적 운영</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {featuredProducts.length} / {quoteProducts.length}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              추천상품 {featuredProducts.length}개, 견적형 {quoteProducts.length}개
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">주문 현황</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {paidOrders.length}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              결제완료 {paidOrders.length}건 / 출고 진행 {preparingOrders.length}건
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">견적 문의</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{quotes.length}</div>
            <p className="mt-2 text-sm text-slate-500">
              신규 {newQuotes.length}건 / 확인중 {reviewingQuotes.length}건
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-900">빠른 운영 작업</h2>
                <p className="mt-2 text-sm text-slate-500">
                  자주 사용하는 운영 메뉴와 우선 처리 항목을 바로 이동할 수 있습니다.
                </p>
              </div>
              <Link
                href="/admin/products/new"
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                새 상품 등록
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Link
                href="/admin/products"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-900 hover:bg-white"
              >
                <div className="text-sm font-semibold text-slate-500">상품 운영</div>
                <div className="mt-2 text-xl font-black text-slate-900">
                  검색, 수정, 추천 토글, 비활성화
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  카테고리 필터, featured 필터, 즉시결제/견적형 구분까지 한 화면에서 관리합니다.
                </p>
              </Link>
              <Link
                href="/admin/orders"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-900 hover:bg-white"
              >
                <div className="text-sm font-semibold text-slate-500">주문 운영</div>
                <div className="mt-2 text-xl font-black text-slate-900">
                  결제 확인, 출고 상태, 환불/세금계산서 관리
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  주문 상세에서 상품 스냅샷과 배송 정보, 메모, 환불 이력까지 확인할 수 있습니다.
                </p>
              </Link>
              <Link
                href="/admin/quotes"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-900 hover:bg-white"
              >
                <div className="text-sm font-semibold text-slate-500">견적 운영</div>
                <div className="mt-2 text-xl font-black text-slate-900">
                  신규 문의 확인, 상태 변경, 관리자 메모 저장
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  현장 납품, 사업자 발주, 세금계산서 상담 요청 건을 빠르게 골라볼 수 있습니다.
                </p>
              </Link>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-semibold text-slate-500">대량 동기화 가이드</div>
                <div className="mt-2 text-xl font-black text-slate-900">
                  `npm run sync:products:stage4`
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  카테고리형 seed를 기반으로 대량 상품을 업데이트하고 추천상품 refresh까지 한 번에 진행합니다.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">운영 체크포인트</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                상품 이미지가 부족한 품목은 카테고리 대표 썸네일이 노출되고 있습니다. 실오픈 전에는 관리자 업로드 이미지 우선으로 교체하는 것이 좋습니다.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                가격 변동이 큰 골재, 장척 목재, 대구경 배관류는 견적형 상품으로 유지하고, 현장 납품 조건을 함께 관리하는 흐름이 가장 안정적입니다.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                사업자 주문은 주문 또는 견적 단계에서 세금계산서 상태까지 이어지므로, 출고 전 관리자 메모와 발행 상태를 함께 확인하는 것이 좋습니다.
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-slate-900">최근 상품</h2>
              <Link href="/admin/products" className="text-sm font-semibold text-slate-600 hover:text-slate-950">
                전체 보기
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {recentProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{product.name}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {(product.category_main || product.category || "미분류").trim()} · {formatPrice(product.price)}
                      </div>
                    </div>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100"
                    >
                      수정
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-slate-900">최근 주문</h2>
              <Link href="/admin/orders" className="text-sm font-semibold text-slate-600 hover:text-slate-950">
                전체 보기
              </Link>
            </div>
            {orderNotice ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {orderNotice}
              </div>
            ) : null}
            <div className="mt-5 space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <Link
                    key={order.order_id}
                    href={`/admin/orders/${order.id ?? order.order_id}`}
                    className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-900 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{order.order_name}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {order.customer.name} · {formatDateTime(order.created_at)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">
                          {formatPrice(order.amount)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{order.status}</div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  아직 주문 데이터가 없습니다.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-slate-900">최근 견적문의</h2>
              <Link href="/admin/quotes" className="text-sm font-semibold text-slate-600 hover:text-slate-950">
                전체 보기
              </Link>
            </div>
            {quoteNotice ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {quoteNotice}
              </div>
            ) : null}
            <div className="mt-5 space-y-4">
              {recentQuotes.length > 0 ? (
                recentQuotes.map((quote) => (
                  <Link
                    key={String(quote.id)}
                    href={`/admin/quotes/${quote.id}`}
                    className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-900 hover:bg-white"
                  >
                    <div className="font-semibold text-slate-900">{quote.customer_name}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {quote.product_name || "상품 지정 없음"} · {formatDateTime(quote.created_at)}
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      {quote.company_name || "개인 문의"} / {quote.status}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  아직 견적문의가 없습니다.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
