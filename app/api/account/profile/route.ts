import { NextRequest, NextResponse } from "next/server";
import { enforceAccountMutationSecurity, requireAccountApiUser } from "@/lib/account-api";
import { getMemberProfile, isMissingMemberTablesError, updateMemberProfile } from "@/lib/account";
import { logServerError } from "@/lib/security";
import { normalizeBusinessNumber, normalizePhoneNumber } from "@/lib/utils";
import { accountProfilePatchSchema } from "@/lib/validation";

export async function GET() {
  const { user, response } = await requireAccountApiUser();

  if (!user) {
    return response;
  }

  try {
    const profile = await getMemberProfile(user);
    return NextResponse.json({ profile });
  } catch (error) {
    logServerError("account-profile-get", error);

    return NextResponse.json(
      {
        message: isMissingMemberTablesError(error)
          ? "member_schema.sql 적용이 필요합니다."
          : "회원 정보를 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { user, response } = await requireAccountApiUser();

  if (!user) {
    return response;
  }

  const securityResponse = enforceAccountMutationSecurity(req, "profile-patch");

  if (securityResponse) {
    return securityResponse;
  }

  try {
    const parsed = accountProfilePatchSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: "회원 정보 입력값을 다시 확인해주세요." },
        { status: 400 }
      );
    }

    const body = parsed.data;
    const profile = await updateMemberProfile(user, {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      phone:
        typeof body.phone === "string" ? normalizePhoneNumber(body.phone) : undefined,
      default_address:
        typeof body.defaultAddress === "string" ? body.defaultAddress.trim() : undefined,
      default_detail_address:
        typeof body.defaultDetailAddress === "string"
          ? body.defaultDetailAddress.trim()
          : undefined,
      zipcode: typeof body.zipcode === "string" ? body.zipcode.trim() : undefined,
      receive_marketing: body.receiveMarketing === true,
      company_name:
        typeof body.companyName === "string" ? body.companyName.trim() : undefined,
      business_number:
        typeof body.businessNumber === "string"
          ? normalizeBusinessNumber(body.businessNumber)
          : undefined,
      tax_email:
        typeof body.taxEmail === "string" ? body.taxEmail.trim() : undefined,
      business_address:
        typeof body.businessAddress === "string"
          ? body.businessAddress.trim()
          : undefined,
      business_detail_address:
        typeof body.businessDetailAddress === "string"
          ? body.businessDetailAddress.trim()
          : undefined,
      manager_name:
        typeof body.managerName === "string" ? body.managerName.trim() : undefined,
      manager_phone:
        typeof body.managerPhone === "string"
          ? normalizePhoneNumber(body.managerPhone)
          : undefined,
      business_type:
        typeof body.businessType === "string" ? body.businessType.trim() : undefined,
      business_item:
        typeof body.businessItem === "string" ? body.businessItem.trim() : undefined,
      bulk_purchase_enabled: body.bulkPurchaseEnabled === true,
      preferred_payment_method:
        typeof body.preferredPaymentMethod === "string"
          ? body.preferredPaymentMethod.trim()
          : undefined,
      favorite_categories: Array.isArray(body.favoriteCategories)
        ? body.favoriteCategories
            .map((item: unknown) => (typeof item === "string" ? item.trim() : ""))
            .filter(Boolean)
        : undefined,
      saved_delivery_requests: Array.isArray(body.savedDeliveryRequests)
        ? body.savedDeliveryRequests
            .map((item: unknown) => (typeof item === "string" ? item.trim() : ""))
            .filter(Boolean)
        : undefined,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    logServerError("account-profile-patch", error);

    return NextResponse.json(
      {
        message: isMissingMemberTablesError(error)
          ? "member_schema.sql 적용이 필요합니다."
          : "회원 정보를 저장하는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
