import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import {
  requirePublicSupabaseEnv,
  requireSupabaseServiceRoleKey,
} from "@/lib/env";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = requirePublicSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components에서는 쿠키 쓰기가 불가능할 수 있으므로 무시합니다.
        }
      },
    },
  });
}

export function createAdminSupabaseClient() {
  const { url } = requirePublicSupabaseEnv();

  return createClient(url, requireSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
