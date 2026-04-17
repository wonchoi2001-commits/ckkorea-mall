import AdminQuotesManager from "@/components/admin/AdminQuotesManager";
import { requireAdminUser } from "@/lib/auth";
import { getQuoteRequestRecords, isMissingQuoteRequestsTableError } from "@/lib/quotes";

export default async function AdminQuotesPage() {
  const adminUser = await requireAdminUser();

  try {
    const quotes = await getQuoteRequestRecords();

    return (
      <AdminQuotesManager
        initialQuotes={quotes}
        adminEmail={adminUser.email ?? "관리자"}
      />
    );
  } catch (error) {
    console.error("ADMIN QUOTES PAGE LOAD ERROR:", error);

    return (
      <AdminQuotesManager
        initialQuotes={[]}
        adminEmail={adminUser.email ?? "관리자"}
        initialError={
          isMissingQuoteRequestsTableError(error)
            ? "quote_requests 테이블이 아직 없습니다. Supabase SQL Editor에서 quote_requests 스키마를 먼저 실행해주세요."
            : "견적문의 목록을 불러오는 중 오류가 발생했습니다."
        }
      />
    );
  }
}
