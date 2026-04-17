import AdminProductsManager from "@/components/admin/AdminProductsManager";
import { requireAdminUser } from "@/lib/auth";
import { getProductRecords } from "@/lib/products";

export default async function AdminProductsPage() {
  const adminUser = await requireAdminUser();
  const products = await getProductRecords({ includeInactive: true });

  return (
    <AdminProductsManager
      initialProducts={products}
      adminEmail={adminUser.email ?? "관리자"}
    />
  );
}
