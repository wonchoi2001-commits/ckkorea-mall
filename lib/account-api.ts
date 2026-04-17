import { NextResponse } from "next/server";
import { applyRateLimit, getRequestIp, isSameOriginRequest } from "@/lib/security";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireAccountApiUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "로그인이 필요한 기능입니다." },
        { status: 401 }
      ),
    };
  }

  return { user, response: null };
}

export function enforceAccountMutationSecurity(request: Request, action: string) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { message: "허용되지 않은 요청입니다." },
      { status: 403 }
    );
  }

  const limit = applyRateLimit({
    key: `account:${action}:${getRequestIp(request)}`,
    limit: 60,
    windowMs: 60_000,
  });

  if (!limit.ok) {
    return NextResponse.json(
      { message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

  return null;
}
