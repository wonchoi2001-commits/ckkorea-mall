import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { isAdminUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json(
    {
      ok: false,
      message,
      ...(extra ?? {}),
    },
    { status }
  );
}

export function jsonOk(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(
    {
      ok: true,
      ...payload,
    },
    { status }
  );
}

export async function requireAdminApiUser(): Promise<
  | {
      user: User;
      response: null;
    }
  | {
      user: null;
      response: NextResponse;
    }
> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      response: jsonError("관리자 로그인이 필요합니다.", 401),
    };
  }

  if (!isAdminUser(user)) {
    return {
      user: null,
      response: jsonError("관리자 권한이 없습니다.", 403),
    };
  }

  return {
    user,
    response: null,
  };
}
