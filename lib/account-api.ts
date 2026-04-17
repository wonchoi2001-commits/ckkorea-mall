import { NextResponse } from "next/server";
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
