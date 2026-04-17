import type { OrderRecord, QuoteRequestRecord } from "@/lib/types";

type SendEmailParams = {
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string[];
};

function parseEmailList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getAdminNotificationRecipients(kind: "order" | "quote") {
  if (kind === "order") {
    return Array.from(
      new Set([
        ...parseEmailList(process.env.ORDER_RECEIVER_EMAILS),
        ...parseEmailList(process.env.ADMIN_NOTIFICATION_EMAILS),
        ...parseEmailList(process.env.QUOTE_RECEIVER_EMAIL),
      ])
    );
  }

  return Array.from(
    new Set([
      ...parseEmailList(process.env.QUOTE_RECEIVER_EMAILS),
      ...parseEmailList(process.env.ADMIN_NOTIFICATION_EMAILS),
      ...parseEmailList(process.env.QUOTE_RECEIVER_EMAIL),
    ])
  );
}

async function sendEmail(params: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_FROM_EMAIL;

  if (!apiKey || !from || params.to.length === 0) {
    return { ok: false, skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "ckkorea-mall/1.0",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      ...(params.replyTo?.length
        ? {
            reply_to:
              params.replyTo.length === 1 ? params.replyTo[0] : params.replyTo,
          }
        : {}),
    }),
  });

  if (!response.ok) {
    const data = await response.text();
    throw new Error(`RESEND_SEND_FAILED:${response.status}:${data}`);
  }

  return { ok: true, skipped: false };
}

async function sendWebhookNotification(payload: Record<string, unknown>) {
  const webhookUrl = process.env.ADMIN_NOTIFICATION_WEBHOOK_URL;

  if (!webhookUrl) {
    return { ok: false, skipped: true };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.text();
    throw new Error(`ADMIN_WEBHOOK_FAILED:${response.status}:${data}`);
  }

  return { ok: true, skipped: false };
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildOrderItemsText(order: OrderRecord) {
  return order.items
    .map((item) => `${item.name} ${item.quantity}개 (${formatPrice(item.subtotal)})`)
    .join(", ");
}

function buildQuoteTitle(quote: QuoteRequestRecord) {
  return quote.product_name?.trim() || "일반 견적문의";
}

export async function notifyOrderPaid(order: OrderRecord) {
  const adminRecipients = getAdminNotificationRecipients("order");
  const orderItemsText = buildOrderItemsText(order);
  const businessSummary = order.business?.isBusinessOrder
    ? [
        `사업자주문: 예`,
        `사업자명: ${order.business.companyName || order.customer.company || "-"}`,
        `사업자등록번호: ${order.business.businessNumber || "-"}`,
        `프로젝트명: ${order.business.projectName || "-"}`,
        `세금계산서 요청: ${order.business.taxInvoiceRequested ? "예" : "아니오"}`,
        `세금계산서 이메일: ${order.business.taxInvoiceEmail || "-"}`,
      ].join("\n")
    : "사업자주문: 아니오";

  const adminText = [
    "[씨케이코리아] 신규 주문 접수",
    `주문번호: ${order.order_id}`,
    `주문명: ${order.order_name}`,
    `주문시각: ${formatDateTime(order.approved_at ?? order.created_at)}`,
    `결제금액: ${formatPrice(order.amount)}`,
    `주문자: ${order.customer.name} / ${order.customer.phone} / ${order.customer.email}`,
    `수령인: ${order.shipping.receiver} / ${order.shipping.phone}`,
    `주소: (${order.shipping.zipCode}) ${order.shipping.address1} ${order.shipping.address2 ?? ""}`.trim(),
    `상품: ${orderItemsText}`,
    businessSummary,
  ].join("\n");

  const customerText = [
    `${order.customer.name}님, 주문이 정상 접수되었습니다.`,
    `주문번호: ${order.order_id}`,
    `주문명: ${order.order_name}`,
    `결제금액: ${formatPrice(order.amount)}`,
    `결제시각: ${formatDateTime(order.approved_at ?? order.created_at)}`,
    order.business?.taxInvoiceRequested
      ? "세금계산서 요청이 접수되었습니다. 관리자 확인 후 발행 상태를 안내드리겠습니다."
      : "배송 준비가 시작되면 관리자 화면에서 확인 후 순차 안내됩니다.",
  ].join("\n");

  const adminHtml = `
    <h2>신규 주문 접수</h2>
    <p><strong>주문번호</strong> ${escapeHtml(order.order_id)}</p>
    <p><strong>주문명</strong> ${escapeHtml(order.order_name)}</p>
    <p><strong>결제금액</strong> ${escapeHtml(formatPrice(order.amount))}</p>
    <p><strong>주문자</strong> ${escapeHtml(order.customer.name)} / ${escapeHtml(order.customer.phone)} / ${escapeHtml(order.customer.email)}</p>
    <p><strong>수령인</strong> ${escapeHtml(order.shipping.receiver)} / ${escapeHtml(order.shipping.phone)}</p>
    <p><strong>주소</strong> ${escapeHtml(`(${order.shipping.zipCode}) ${order.shipping.address1} ${order.shipping.address2 ?? ""}`.trim())}</p>
    <p><strong>상품</strong> ${escapeHtml(orderItemsText)}</p>
    <p><strong>사업자주문</strong> ${order.business?.isBusinessOrder ? "예" : "아니오"}</p>
    <p><strong>세금계산서 요청</strong> ${order.business?.taxInvoiceRequested ? "예" : "아니오"}</p>
  `;

  const customerHtml = `
    <h2>주문이 접수되었습니다</h2>
    <p><strong>주문번호</strong> ${escapeHtml(order.order_id)}</p>
    <p><strong>주문명</strong> ${escapeHtml(order.order_name)}</p>
    <p><strong>결제금액</strong> ${escapeHtml(formatPrice(order.amount))}</p>
    <p><strong>결제시각</strong> ${escapeHtml(formatDateTime(order.approved_at ?? order.created_at))}</p>
    ${
      order.business?.taxInvoiceRequested
        ? "<p>세금계산서 요청이 접수되었습니다. 관리자 확인 후 발행 상태를 안내드리겠습니다.</p>"
        : "<p>배송 준비가 시작되면 순차적으로 안내드리겠습니다.</p>"
    }
  `;

  const tasks: Promise<unknown>[] = [
    sendWebhookNotification({
      event: "order.paid",
      orderId: order.order_id,
      orderName: order.order_name,
      amount: order.amount,
      customer: order.customer,
      shipping: order.shipping,
      items: order.items,
      business: order.business ?? null,
    }),
  ];

  if (adminRecipients.length > 0) {
    tasks.push(
      sendEmail({
        to: adminRecipients,
        subject: `[씨케이코리아] 신규 주문 ${order.order_id}`,
        text: adminText,
        html: adminHtml,
        replyTo: [order.customer.email],
      })
    );
  }

  if (order.customer.email) {
    tasks.push(
      sendEmail({
        to: [order.customer.email],
        subject: `[씨케이코리아] 주문이 접수되었습니다 (${order.order_id})`,
        text: customerText,
        html: customerHtml,
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  const rejected = results.filter((result) => result.status === "rejected");

  if (rejected.length > 0) {
    console.error("ORDER NOTIFICATION ERROR:", rejected);
  }
}

export async function notifyQuoteRequestReceived(quote: QuoteRequestRecord) {
  const adminRecipients = getAdminNotificationRecipients("quote");
  const quoteTitle = buildQuoteTitle(quote);
  const adminText = [
    "[씨케이코리아] 신규 견적문의 접수",
    `접수시각: ${formatDateTime(quote.created_at)}`,
    `문의명: ${quoteTitle}`,
    `담당자: ${quote.customer_name} / ${quote.phone} / ${quote.email}`,
    `회사명: ${quote.company_name || "-"}`,
    `사업자주문: ${quote.is_business_order ? "예" : "아니오"}`,
    `사업자등록번호: ${quote.business_number || "-"}`,
    `세금계산서 요청: ${quote.tax_invoice_needed ? "예" : "아니오"}`,
    `세금계산서 이메일: ${quote.tax_invoice_email || "-"}`,
    `프로젝트명: ${quote.project_name || "-"}`,
    `수량: ${quote.quantity || "-"}`,
    `규격: ${quote.spec || "-"}`,
    `배송방식: ${quote.delivery_type || "-"}`,
    `납품지역: ${quote.delivery_area || "-"}`,
    `희망납기일: ${quote.request_date || "-"}`,
    `문의내용: ${quote.message}`,
  ].join("\n");

  const customerText = [
    `${quote.customer_name}님, 견적문의가 접수되었습니다.`,
    `문의 상품: ${quoteTitle}`,
    `접수시각: ${formatDateTime(quote.created_at)}`,
    "확인 후 입력해주신 연락처 또는 이메일로 회신드리겠습니다.",
  ].join("\n");

  const adminHtml = `
    <h2>신규 견적문의 접수</h2>
    <p><strong>문의명</strong> ${escapeHtml(quoteTitle)}</p>
    <p><strong>담당자</strong> ${escapeHtml(quote.customer_name)} / ${escapeHtml(quote.phone)} / ${escapeHtml(quote.email)}</p>
    <p><strong>회사명</strong> ${escapeHtml(quote.company_name || "-")}</p>
    <p><strong>사업자등록번호</strong> ${escapeHtml(quote.business_number || "-")}</p>
    <p><strong>세금계산서 요청</strong> ${quote.tax_invoice_needed ? "예" : "아니오"}</p>
    <p><strong>프로젝트명</strong> ${escapeHtml(quote.project_name || "-")}</p>
    <p><strong>문의내용</strong><br />${escapeHtml(quote.message).replaceAll("\n", "<br />")}</p>
  `;

  const customerHtml = `
    <h2>견적문의가 접수되었습니다</h2>
    <p><strong>문의 상품</strong> ${escapeHtml(quoteTitle)}</p>
    <p><strong>접수시각</strong> ${escapeHtml(formatDateTime(quote.created_at))}</p>
    <p>확인 후 입력해주신 연락처 또는 이메일로 회신드리겠습니다.</p>
  `;

  const tasks: Promise<unknown>[] = [
    sendWebhookNotification({
      event: "quote.received",
      quote,
    }),
  ];

  if (adminRecipients.length > 0) {
    tasks.push(
      sendEmail({
        to: adminRecipients,
        subject: `[씨케이코리아] 신규 견적문의 ${quoteTitle}`,
        text: adminText,
        html: adminHtml,
        replyTo: [quote.email],
      })
    );
  }

  if (quote.email) {
    tasks.push(
      sendEmail({
        to: [quote.email],
        subject: "[씨케이코리아] 견적문의가 접수되었습니다",
        text: customerText,
        html: customerHtml,
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  const rejected = results.filter((result) => result.status === "rejected");

  if (rejected.length > 0) {
    console.error("QUOTE NOTIFICATION ERROR:", rejected);
  }
}
