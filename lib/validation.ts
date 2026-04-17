import { z } from "zod";

const trimmedString = z.string().trim();
const optionalTrimmedString = trimmedString.optional();
const optionalNullableTrimmedString = trimmedString.nullish();
const emailString = trimmedString.email("올바른 이메일 형식을 입력해주세요.");
const phoneString = trimmedString
  .min(9, "연락처를 확인해주세요.")
  .max(20, "연락처를 확인해주세요.");
const businessNumberString = trimmedString
  .min(10, "사업자등록번호를 확인해주세요.")
  .max(12, "사업자등록번호를 확인해주세요.");

export const loginSchema = z.object({
  email: emailString,
  password: trimmedString.min(8, "비밀번호는 8자 이상이어야 합니다."),
});

export const signupSchema = z.object({
  name: trimmedString.min(1, "이름을 입력해주세요.").max(60),
  email: emailString,
  password: trimmedString.min(8, "비밀번호는 8자 이상이어야 합니다.").max(72),
  phone: phoneString,
  memberType: z.enum(["personal", "business"]),
  termsConsent: z.boolean(),
  privacyConsent: z.boolean(),
  receiveMarketing: z.boolean().optional(),
  companyName: optionalTrimmedString,
  businessNumber: optionalTrimmedString,
  managerName: optionalTrimmedString,
  managerPhone: optionalTrimmedString,
  taxEmail: optionalTrimmedString,
}).superRefine((value, ctx) => {
  if (!value.termsConsent) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["termsConsent"],
      message: "이용약관 동의가 필요합니다.",
    });
  }

  if (!value.privacyConsent) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["privacyConsent"],
      message: "개인정보처리방침 동의가 필요합니다.",
    });
  }

  if (value.memberType === "business") {
    if (!value.companyName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["companyName"], message: "회사명을 입력해주세요." });
    }
    if (!value.businessNumber) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["businessNumber"], message: "사업자등록번호를 입력해주세요." });
    }
    if (!value.managerName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["managerName"], message: "담당자명을 입력해주세요." });
    }
  }
});

export const forgotPasswordSchema = z.object({
  email: emailString,
});

export const resetPasswordSchema = z
  .object({
    password: trimmedString.min(8, "비밀번호는 8자 이상이어야 합니다.").max(72),
    confirmPassword: trimmedString.min(8),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "비밀번호 확인이 일치하지 않습니다.",
  });

export const quoteRequestSchema = z
  .object({
    customer_name: trimmedString.min(1, "이름을 입력해주세요.").max(60),
    phone: phoneString,
    email: emailString,
    message: trimmedString.min(1, "문의 내용을 입력해주세요.").max(5000),
    is_business_order: z.boolean().optional(),
    company_name: optionalTrimmedString,
    business_number: optionalTrimmedString,
    tax_invoice_needed: z.boolean().optional(),
    tax_invoice_email: optionalTrimmedString,
    project_name: optionalTrimmedString,
    product_name: optionalTrimmedString,
    product_slug: optionalTrimmedString,
    quantity: optionalTrimmedString,
    spec: optionalTrimmedString,
    delivery_type: optionalTrimmedString,
    delivery_area: optionalTrimmedString,
    request_date: optionalTrimmedString,
  })
  .superRefine((value, ctx) => {
    if ((value.is_business_order || value.tax_invoice_needed) && !value.company_name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["company_name"], message: "회사명을 입력해주세요." });
    }

    if ((value.is_business_order || value.tax_invoice_needed) && !value.business_number) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["business_number"],
        message: "사업자등록번호를 입력해주세요.",
      });
    }

    if (value.tax_invoice_needed && !(value.tax_invoice_email || value.email)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tax_invoice_email"],
        message: "세금계산서 수신 이메일을 입력해주세요.",
      });
    }
  });

export const orderCustomerSchema = z.object({
  name: trimmedString.min(1, "주문자명을 입력해주세요.").max(60),
  phone: phoneString,
  email: emailString,
  company: optionalTrimmedString,
});

export const orderShippingSchema = z.object({
  receiver: trimmedString.min(1, "수령인명을 입력해주세요.").max(60),
  phone: phoneString,
  zipCode: trimmedString.min(1, "우편번호를 입력해주세요.").max(20),
  address1: trimmedString.min(1, "주소를 입력해주세요.").max(240),
  address2: optionalTrimmedString,
  deliveryMemo: optionalTrimmedString,
});

export const businessOrderSchema = z
  .object({
    isBusinessOrder: z.boolean().optional(),
    companyName: optionalTrimmedString,
    businessNumber: optionalTrimmedString,
    ceoName: optionalTrimmedString,
    businessType: optionalTrimmedString,
    businessItem: optionalTrimmedString,
    projectName: optionalTrimmedString,
    purchaseOrderNumber: optionalTrimmedString,
    taxInvoiceRequested: z.boolean().optional(),
    taxInvoiceEmail: optionalTrimmedString,
  })
  .superRefine((value, ctx) => {
    if ((value.isBusinessOrder || value.taxInvoiceRequested) && !value.companyName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["companyName"], message: "회사명을 입력해주세요." });
    }

    if ((value.isBusinessOrder || value.taxInvoiceRequested) && !value.businessNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["businessNumber"],
        message: "사업자등록번호를 입력해주세요.",
      });
    }

    if (value.taxInvoiceRequested && !value.taxInvoiceEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["taxInvoiceEmail"],
        message: "세금계산서 수신 이메일을 입력해주세요.",
      });
    }
  });

export const orderCreateSchema = z.object({
  productId: optionalTrimmedString,
  quantity: z.coerce.number().int().min(1).max(999).optional(),
  items: z
    .array(
      z.object({
        productId: trimmedString.min(1).max(120),
        quantity: z.coerce.number().int().min(1).max(999),
      })
    )
    .optional(),
  customer: orderCustomerSchema,
  shipping: orderShippingSchema,
  business: businessOrderSchema.optional(),
});

export const paymentConfirmSchema = z.object({
  paymentKey: trimmedString.min(1).max(200),
  orderId: trimmedString.min(1).max(120),
  amount: z.coerce.number().int().positive().max(10_000_000_000),
});

export const paymentFailSchema = z.object({
  orderId: trimmedString.min(1).max(120),
  code: optionalTrimmedString,
  message: optionalTrimmedString,
});

export const uploadMetadataSchema = z.object({
  slug: optionalTrimmedString,
});

export const accountProfilePatchSchema = z.object({
  name: optionalTrimmedString,
  phone: optionalTrimmedString,
  defaultAddress: optionalTrimmedString,
  defaultDetailAddress: optionalTrimmedString,
  zipcode: optionalTrimmedString,
  receiveMarketing: z.boolean().optional(),
  companyName: optionalTrimmedString,
  businessNumber: optionalTrimmedString,
  taxEmail: optionalTrimmedString,
  businessAddress: optionalTrimmedString,
  businessDetailAddress: optionalTrimmedString,
  managerName: optionalTrimmedString,
  managerPhone: optionalTrimmedString,
  businessType: optionalTrimmedString,
  businessItem: optionalTrimmedString,
  bulkPurchaseEnabled: z.boolean().optional(),
  preferredPaymentMethod: optionalTrimmedString,
  favoriteCategories: z.array(trimmedString).optional(),
  savedDeliveryRequests: z.array(trimmedString).optional(),
});

export const savedAddressSchema = z.object({
  id: optionalTrimmedString,
  label: optionalTrimmedString,
  recipientName: optionalTrimmedString,
  phone: optionalTrimmedString,
  zipcode: optionalTrimmedString,
  address: optionalTrimmedString,
  detailAddress: optionalTrimmedString,
  deliveryMemo: optionalTrimmedString,
  siteName: optionalTrimmedString,
  isDefault: z.boolean().optional(),
});

export const favoriteMutationSchema = z.object({
  productId: optionalTrimmedString,
  productIds: z.array(trimmedString.min(1).max(120)).optional(),
});

export const recentViewedMutationSchema = favoriteMutationSchema;

export const adminOrderUpdateSchema = z.object({
  orderId: trimmedString.min(1).max(120),
  fulfillment_status: trimmedString.min(1).max(40),
  shipping_carrier: optionalTrimmedString,
  tracking_number: optionalTrimmedString,
  admin_memo: optionalTrimmedString,
  tax_invoice_status: optionalTrimmedString,
  tax_invoice_note: optionalTrimmedString,
});

export const adminQuoteUpdateSchema = z.object({
  id: trimmedString.min(1),
  status: trimmedString.min(1).max(40),
  admin_memo: optionalTrimmedString,
});

export const adminOrderRefundSchema = z.object({
  orderId: trimmedString.min(1).max(120),
  cancelReason: optionalTrimmedString,
});

export const adminOrderPartialRefundSchema = adminOrderRefundSchema.extend({
  refundItems: z
    .array(
      z.object({
        productId: trimmedString.min(1).max(120),
        quantity: z.coerce.number().int().min(1).max(999),
      })
    )
    .min(1, "부분 환불할 상품을 선택해주세요."),
});

export function getValidationMessage(error: z.ZodError, fallback = "입력값을 확인해주세요.") {
  const [issue] = error.issues;
  return issue?.message || fallback;
}
