import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnv, requirePublicSupabaseEnv } from "@/lib/env";

export function createBrowserSupabaseClient() {
  const { url, anonKey } = requirePublicSupabaseEnv();

  return createBrowserClient(url, anonKey);
}

export function createOptionalBrowserSupabaseClient() {
  const env = getPublicSupabaseEnv();

  if (!env) {
    return null;
  }

  return createBrowserClient(env.url, env.anonKey);
}
