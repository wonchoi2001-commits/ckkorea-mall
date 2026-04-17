import AdminOrdersManager from "@/components/admin/AdminOrdersManager";
import { requireAdminUser } from "@/lib/auth";
import { getOrderRecords, isMissingOrdersTableError } from "@/lib/orders";

export default async function AdminOrdersPage() {
  const adminUser = await requireAdminUser();

  try {
    const orders = await getOrderRecords();

    return (
      <AdminOrdersManager
        initialOrders={orders}
        adminEmail={adminUser.email ?? "관리자"}
      />
    );
  } catch (error) {
    console.error("ADMIN ORDERS PAGE LOAD ERROR:", error);

    return (
      <AdminOrdersManager
        initialOrders={[]}
        adminEmail={adminUser.email ?? "관리자"}
        initialError={
          isMissingOrdersTableError(error)
            ? "orders 테이블이 아직 없습니다. Supabase SQL Editor에서 orders 스키마를 먼저 실행해주세요."
            : "주문 목록을 불러오는 중 오류가 발생했습니다."
        }
      />
    );
  }
}
