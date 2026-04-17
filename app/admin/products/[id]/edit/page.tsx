import { notFound } from "next/navigation";
import AdminProductForm from "@/components/admin/AdminProductForm";
import { requireAdminUser } from "@/lib/auth";
import { getProductRecordById } from "@/lib/products";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProductPage({ params }: Props) {
  await requireAdminUser();
  const { id } = await params;
  const product = await getProductRecordById(id, {
    includeInactive: true,
    includeDeleted: true,
  });

  if (!product) {
    notFound();
  }

  return <AdminProductForm product={product} />;
}
