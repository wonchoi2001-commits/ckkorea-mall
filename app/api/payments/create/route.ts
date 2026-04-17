import { NextRequest, NextResponse } from "next/server";
import { isMissingMemberTablesError, saveAddress, updateMemberProfile } from "@/lib/account";
import { buildOrderItem, buildOrderRecordInput, isMissingOrdersTableError, makeOrderId } from "@/lib/orders";
import { getProductRecordById, mapProductRecordToProduct } from "@/lib/products";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import type { BusinessOrderDetails, OrderCustomer, OrderShipping } from "@/lib/types";

export const runtime = "nodejs";

function isValidCustomer(customer: Partial<OrderCustomer> | undefined): customer is OrderCustomer {
  return Boolean(customer?.name && customer?.phone && customer?.email);
}

function isValidShipping(shipping: Partial<OrderShipping> | undefined): shipping is OrderShipping {
  return Boolean(
    shipping?.receiver &&
      shipping?.phone &&
      shipping?.zipCode &&
      shipping?.address1 &&
      shipping?.address2
  );
}

function normalizeBusinessOrder(
  business: Partial<BusinessOrderDetails> | undefined,
  customer: OrderCustomer
) {
  const isBusinessOrder = business?.isBusinessOrder === true;
  const taxInvoiceRequested = business?.taxInvoiceRequested === true;

  if (!isBusinessOrder && !taxInvoiceRequested) {
    return null;
  }

  const companyName =
    typeof business?.companyName === "string" && business.companyName.trim()
      ? business.companyName.trim()
      : customer.company?.trim() || "";
  const businessNumber =
    typeof business?.businessNumber === "string" && business.businessNumber.trim()
      ? business.businessNumber.trim()
      : "";
  const taxInvoiceEmail =
    typeof business?.taxInvoiceEmail === "string" && business.taxInvoiceEmail.trim()
      ? business.taxInvoiceEmail.trim()
      : customer.email;

  if ((isBusinessOrder || taxInvoiceRequested) && (!companyName || !businessNumber)) {
    return { error: "사업자 주문은 회사명과 사업자등록번호가 필요합니다." };
  }

  if (taxInvoiceRequested && !taxInvoiceEmail) {
    return { error: "세금계산서 요청 이메일이 필요합니다." };
  }

  return {
    value: {
      isBusinessOrder,
      companyName,
      businessNumber,
      ceoName:
        typeof business?.ceoName === "string" ? business.ceoName.trim() || undefined : undefined,
      businessType:
        typeof business?.businessType === "string"
          ? business.businessType.trim() || undefined
          : undefined,
      businessItem:
        typeof business?.businessItem === "string"
          ? business.businessItem.trim() || undefined
          : undefined,
      projectName:
        typeof business?.projectName === "string"
          ? business.projectName.trim() || undefined
          : undefined,
      purchaseOrderNumber:
        typeof business?.purchaseOrderNumber === "string"
          ? business.purchaseOrderNumber.trim() || undefined
          : undefined,
      taxInvoiceRequested,
      taxInvoiceEmail: taxInvoiceRequested ? taxInvoiceEmail : undefined,
    } satisfies BusinessOrderDetails,
  };
}

function normalizeRequestedItems(body: {
  productId?: unknown;
  quantity?: unknown;
  items?: unknown;
}) {
  if (Array.isArray(body.items) && body.items.length > 0) {
    const merged = new Map<string, number>();

    for (const item of body.items) {
      const productId =
        item && typeof item === "object" && "productId" in item
          ? String(item.productId)
          : "";
      const quantity =
        item && typeof item === "object" && "quantity" in item
          ? Number(item.quantity)
          : Number.NaN;

      if (!productId || !Number.isInteger(quantity) || quantity < 1) {
        return null;
      }

      merged.set(productId, (merged.get(productId) ?? 0) + quantity);
    }

    return Array.from(merged.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));
  }

  const singleProductId = body.productId ? String(body.productId) : "";
  const singleQuantity = Number(body.quantity);

  if (!singleProductId || !Number.isInteger(singleQuantity) || singleQuantity < 1) {
    return null;
  }

  return [
    {
      productId: singleProductId,
      quantity: singleQuantity,
    },
  ];
}

export async function POST(req: NextRequest) {
  try {
    const { productId, quantity, items, customer, shipping, business } = await req.json();
    const authSupabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await authSupabase.auth.getUser();
    const requestedItems = normalizeRequestedItems({ productId, quantity, items });

    if (!requestedItems || requestedItems.length === 0) {
      return NextResponse.json(
        { message: "상품과 수량 정보가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    if (!isValidCustomer(customer)) {
      return NextResponse.json(
        { message: "주문자 정보를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    if (!isValidShipping(shipping)) {
      return NextResponse.json(
        { message: "배송 정보를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const normalizedBusiness = normalizeBusinessOrder(business, customer);

    if (normalizedBusiness?.error) {
      return NextResponse.json(
        { message: normalizedBusiness.error },
        { status: 400 }
      );
    }

    const resolvedItems = [];

    for (const requestedItem of requestedItems) {
      const selectedProductRecord = await getProductRecordById(requestedItem.productId);

      if (!selectedProductRecord || selectedProductRecord.is_active === false) {
        return NextResponse.json(
          { message: "선택한 상품을 찾을 수 없거나 판매 중이 아닙니다." },
          { status: 404 }
        );
      }

      const selectedProduct = mapProductRecordToProduct(selectedProductRecord);

      if (selectedProduct.price === null) {
        return NextResponse.json(
          { message: "견적문의 상품은 즉시결제할 수 없습니다." },
          { status: 400 }
        );
      }

      if (
        typeof selectedProductRecord.stock === "number" &&
        selectedProductRecord.stock < requestedItem.quantity
      ) {
        return NextResponse.json(
          { message: "재고가 부족합니다. 수량을 확인해주세요." },
          { status: 409 }
        );
      }

      resolvedItems.push(buildOrderItem(selectedProduct, requestedItem.quantity));
    }

    const orderId = makeOrderId();
    const orderInput = buildOrderRecordInput({
      orderId,
      customer,
      shipping,
      items: resolvedItems,
      business: normalizedBusiness?.value,
    });

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .insert([orderInput])
      .select()
      .single();

    if (error) {
      console.error("ORDER CREATE ERROR:", error);

      if (isMissingOrdersTableError(error)) {
        return NextResponse.json(
          {
            message:
              "orders 테이블이 아직 없습니다. Supabase SQL Editor에서 저장용 orders 스키마를 먼저 생성해주세요.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (data?.id) {
      const orderItemRows = resolvedItems.map((item) => ({
        order_id: data.id,
        product_id: item.productId,
        product_name: item.name,
        price: item.unitPrice,
        quantity: item.quantity,
      }));
      const { error: orderItemsError } = await supabase.from("order_items").insert(orderItemRows);

      if (orderItemsError) {
        console.error("ORDER ITEMS INSERT ERROR:", orderItemsError);
        await supabase.from("orders").delete().eq("id", data.id);

        return NextResponse.json(
          { message: "주문 상품 저장 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
    }

    if (user) {
      try {
        if (data?.id) {
          const { error: userIdUpdateError } = await supabase
            .from("orders")
            .update({ user_id: user.id })
            .eq("id", data.id);

          if (userIdUpdateError && userIdUpdateError.code !== "42703") {
            throw userIdUpdateError;
          }
        }

        await updateMemberProfile(user, {
          name: customer.name,
          phone: customer.phone,
          default_address: shipping.address1,
          default_detail_address: shipping.address2,
          zipcode: shipping.zipCode,
          company_name: normalizedBusiness?.value?.companyName,
          business_number: normalizedBusiness?.value?.businessNumber,
          tax_email: normalizedBusiness?.value?.taxInvoiceEmail,
          manager_name: normalizedBusiness?.value?.ceoName || customer.name,
          manager_phone: customer.phone,
          preferred_payment_method: "CARD",
        });

        await saveAddress(user.id, {
          label: shipping.deliveryMemo?.trim()
            ? `최근 사용 배송지 - ${shipping.deliveryMemo.trim()}`
            : "최근 사용 배송지",
          recipient_name: shipping.receiver,
          phone: shipping.phone,
          zipcode: shipping.zipCode,
          address: shipping.address1,
          detail_address: shipping.address2,
          delivery_memo: shipping.deliveryMemo,
          is_default: true,
        });
      } catch (memberError) {
        if (
          !isMissingMemberTablesError(memberError) &&
          !(
            typeof memberError === "object" &&
            memberError !== null &&
            "code" in memberError &&
            memberError.code === "42703"
          )
        ) {
          console.error("ORDER ACCOUNT SAVE ERROR:", memberError);
        }
      }
    }

    return NextResponse.json(
      {
        orderId: data.order_id,
        orderName: data.order_name,
        amount: data.amount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PAYMENTS CREATE ERROR:", error);

    return NextResponse.json(
      { message: "주문 생성 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
