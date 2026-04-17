import { NextRequest, NextResponse } from "next/server";
import {
  deleteSavedAddress,
  getSavedAddresses,
  isMissingMemberTablesError,
  saveAddress,
} from "@/lib/account";
import { enforceAccountMutationSecurity, requireAccountApiUser } from "@/lib/account-api";
import { logServerError } from "@/lib/security";
import { normalizePhoneNumber } from "@/lib/utils";
import { savedAddressSchema } from "@/lib/validation";

export async function GET() {
  const { user, response } = await requireAccountApiUser();

  if (!user) {
    return response;
  }

  try {
    const addresses = await getSavedAddresses(user.id);
    return NextResponse.json({ addresses });
  } catch (error) {
    logServerError("account-addresses-get", error);

    return NextResponse.json(
      {
        message: isMissingMemberTablesError(error)
          ? "member_schema.sql 적용이 필요합니다."
          : "배송지 목록을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireAccountApiUser();

  if (!user) {
    return response;
  }

  const securityResponse = enforceAccountMutationSecurity(req, "addresses-post");

  if (securityResponse) {
    return securityResponse;
  }

  try {
    const parsed = savedAddressSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: "배송지 입력값을 다시 확인해주세요." },
        { status: 400 }
      );
    }

    const body = parsed.data;
    const address = await saveAddress(user.id, {
      label: typeof body.label === "string" ? body.label.trim() : undefined,
      recipient_name:
        typeof body.recipientName === "string" ? body.recipientName.trim() : undefined,
      phone:
        typeof body.phone === "string" ? normalizePhoneNumber(body.phone) : undefined,
      zipcode: typeof body.zipcode === "string" ? body.zipcode.trim() : undefined,
      address: typeof body.address === "string" ? body.address.trim() : undefined,
      detail_address:
        typeof body.detailAddress === "string" ? body.detailAddress.trim() : undefined,
      delivery_memo:
        typeof body.deliveryMemo === "string" ? body.deliveryMemo.trim() : undefined,
      site_name: typeof body.siteName === "string" ? body.siteName.trim() : undefined,
      is_default: body.isDefault === true,
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    logServerError("account-addresses-post", error);
    return NextResponse.json(
      {
        message: isMissingMemberTablesError(error)
          ? "member_schema.sql 적용이 필요합니다."
          : "배송지를 저장하는 중 오류가 발생했습니다.",
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

  const securityResponse = enforceAccountMutationSecurity(req, "addresses-patch");

  if (securityResponse) {
    return securityResponse;
  }

  try {
    const parsed = savedAddressSchema.safeParse(await req.json());

    if (!parsed.success || !parsed.data.id) {
      return NextResponse.json({ message: "수정할 배송지 정보를 다시 확인해주세요." }, { status: 400 });
    }

    const body = parsed.data;

    const address = await saveAddress(user.id, {
      id: String(body.id),
      label: typeof body.label === "string" ? body.label.trim() : undefined,
      recipient_name:
        typeof body.recipientName === "string" ? body.recipientName.trim() : undefined,
      phone:
        typeof body.phone === "string" ? normalizePhoneNumber(body.phone) : undefined,
      zipcode: typeof body.zipcode === "string" ? body.zipcode.trim() : undefined,
      address: typeof body.address === "string" ? body.address.trim() : undefined,
      detail_address:
        typeof body.detailAddress === "string" ? body.detailAddress.trim() : undefined,
      delivery_memo:
        typeof body.deliveryMemo === "string" ? body.deliveryMemo.trim() : undefined,
      site_name: typeof body.siteName === "string" ? body.siteName.trim() : undefined,
      is_default: body.isDefault === true,
    });

    return NextResponse.json({ address });
  } catch (error) {
    logServerError("account-addresses-patch", error);
    return NextResponse.json(
      {
        message: isMissingMemberTablesError(error)
          ? "member_schema.sql 적용이 필요합니다."
          : "배송지를 수정하는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { user, response } = await requireAccountApiUser();

  if (!user) {
    return response;
  }

  const securityResponse = enforceAccountMutationSecurity(req, "addresses-delete");

  if (securityResponse) {
    return securityResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "삭제할 배송지 ID가 필요합니다." }, { status: 400 });
    }

    await deleteSavedAddress(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    logServerError("account-addresses-delete", error);
    return NextResponse.json(
      {
        message: isMissingMemberTablesError(error)
          ? "member_schema.sql 적용이 필요합니다."
          : "배송지를 삭제하는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
