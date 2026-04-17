import AdminProductForm from "@/components/admin/AdminProductForm";
import { requireAdminUser } from "@/lib/auth";

export default async function AdminNewProductPage() {
  await requireAdminUser();

  return <AdminProductForm />;
}
