import { NextResponse } from "next/server";
import { notifyQuoteRequestReceived } from "@/lib/notifications";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { isMissingQuoteRequestsTableError } from "@/lib/quotes";

export async function POST(req: Request) {
  try {
    const authSupabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await authSupabase.auth.getUser();
    const body = await req.json();
    const customerName =
      typeof body?.customer_name === "string" ? body.customer_name.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const isBusinessOrder = body?.is_business_order === true;
    const companyName =
      typeof body?.company_name === "string" ? body.company_name.trim() : "";
    const businessNumber =
      typeof body?.business_number === "string" ? body.business_number.trim() : "";
    const taxInvoiceNeeded = body?.tax_invoice_needed === true;
    const taxInvoiceEmail =
      typeof body?.tax_invoice_email === "string" ? body.tax_invoice_email.trim() : "";

    if (!customerName || !phone || !email || !message) {
      return NextResponse.json(
        { message: "이름, 연락처, 이메일, 문의내용은 필수 입력입니다." },
        { status: 400 }
      );
    }

    if ((isBusinessOrder || taxInvoiceNeeded) && (!companyName || !businessNumber)) {
      return NextResponse.json(
        { message: "사업자 문의는 회사명과 사업자등록번호를 입력해주세요." },
        { status: 400 }
      );
    }

    if (taxInvoiceNeeded && !(taxInvoiceEmail || email)) {
      return NextResponse.json(
        { message: "세금계산서 수신 이메일을 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("quote_requests")
      .insert([
        {
          customer_name: customerName,
          phone,
          email,
          is_business_order: isBusinessOrder,
          company_name: companyName || null,
          business_number: businessNumber || null,
          project_name:
            typeof body?.project_name === "string" ? body.project_name.trim() || null : null,
          tax_invoice_needed: taxInvoiceNeeded,
          tax_invoice_email: taxInvoiceNeeded ? taxInvoiceEmail || email : null,
          product_name:
            typeof body?.product_name === "string" ? body.product_name.trim() || null : null,
          product_slug:
            typeof body?.product_slug === "string" ? body.product_slug.trim() || null : null,
          quantity:
            typeof body?.quantity === "string" ? body.quantity.trim() || null : null,
          spec: typeof body?.spec === "string" ? body.spec.trim() || null : null,
          delivery_type:
            typeof body?.delivery_type === "string"
              ? body.delivery_type.trim() || null
              : null,
          delivery_area:
            typeof body?.delivery_area === "string"
              ? body.delivery_area.trim() || null
              : null,
          request_date:
            typeof body?.request_date === "string" ? body.request_date || null : null,
          message,
          status: "NEW",
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("QUOTE REQUEST INSERT ERROR:", error);

      if (isMissingQuoteRequestsTableError(error)) {
        return NextResponse.json(
          {
            message:
              "quote_requests 테이블이 아직 없습니다. Supabase SQL Editor에서 quote_requests 스키마를 먼저 생성해주세요.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    try {
      if (user && data?.id) {
        const { error: userIdUpdateError } = await supabase
          .from("quote_requests")
          .update({ user_id: user.id })
          .eq("id", data.id);

        if (userIdUpdateError && userIdUpdateError.code !== "42703") {
          throw userIdUpdateError;
        }
      }

      await notifyQuoteRequestReceived(data);
    } catch (notificationError) {
      console.error("QUOTE REQUEST NOTIFICATION ERROR:", notificationError);
    }

    return NextResponse.json(
      { ok: true, id: data.id, message: "견적문의가 접수되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("QUOTE REQUEST ERROR:", error);

    return NextResponse.json(
      { message: "견적문의 접수 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
