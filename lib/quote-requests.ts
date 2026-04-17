import { NextResponse } from "next/server";
import { notifyQuoteRequestReceived } from "@/lib/notifications";
import { applyRateLimit, getRequestIp, isSameOriginRequest, logServerError } from "@/lib/security";
import {
  createAdminSupabaseClient,
  createServerSupabaseClient,
} from "@/lib/supabase/server";
import { isMissingQuoteRequestsTableError } from "@/lib/quotes";
import { quoteRequestSchema } from "@/lib/validation";

export async function handleQuoteRequestPost(req: Request) {
  try {
    if (!isSameOriginRequest(req)) {
      return NextResponse.json(
        { message: "허용되지 않은 요청입니다." },
        { status: 403 }
      );
    }

    const rateLimit = applyRateLimit({
      key: `quotes:${getRequestIp(req)}`,
      limit: 8,
      windowMs: 60_000,
    });

    if (!rateLimit.ok) {
      return NextResponse.json(
        { message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const authSupabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await authSupabase.auth.getUser();
    const parsed = quoteRequestSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: "견적문의 입력값을 다시 확인해주세요." },
        { status: 400 }
      );
    }

    const body = parsed.data;
    const customerName = body.customer_name.trim();
    const phone = body.phone.trim();
    const email = body.email.trim();
    const message = body.message.trim();
    const isBusinessOrder = body.is_business_order === true;
    const companyName = body.company_name?.trim() || "";
    const businessNumber = body.business_number?.trim() || "";
    const taxInvoiceNeeded = body.tax_invoice_needed === true;
    const taxInvoiceEmail = body.tax_invoice_email?.trim() || "";

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
      logServerError("quote-request-insert", error);

      if (isMissingQuoteRequestsTableError(error)) {
        return NextResponse.json(
          {
            message:
              "quote_requests 테이블이 아직 없습니다. Supabase SQL Editor에서 quote_requests 스키마를 먼저 생성해주세요.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "견적문의 접수 중 오류가 발생했습니다." },
        { status: 500 }
      );
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
      logServerError("quote-request-notification", notificationError);
    }

    return NextResponse.json(
      { ok: true, id: data.id, message: "견적문의가 접수되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    logServerError("quote-request", error);

    return NextResponse.json(
      { message: "견적문의 접수 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
