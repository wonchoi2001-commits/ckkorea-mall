import { notFound } from "next/navigation";
import AdminOrderDetail from "@/components/admin/AdminOrderDetail";
import { requireAdminUser } from "@/lib/auth";
import { getOrderItemRecords, getOrderRecord } from "@/lib/orders";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: Props) {
  await requireAdminUser();
  const { id } = await params;
  const order = await getOrderRecord(id);

  if (!order) {
    notFound();
  }

  const orderItems = order.id ? await getOrderItemRecords(String(order.id)) : [];

  return <AdminOrderDetail order={order} orderItems={orderItems} />;
}
