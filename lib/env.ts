import { z } from "zod";

type PublicSupabaseEnv = {
  url: string;
  anonKey: string;
};

const nonEmptyString = z.string().trim().min(1);
const publicSupabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: nonEmptyString.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: nonEmptyString,
});
const serverSecretSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: nonEmptyString,
});
const signingSecretSchema = z.object({
  APP_SIGNING_SECRET: nonEmptyString.optional(),
  SUPABASE_SERVICE_ROLE_KEY: nonEmptyString.optional(),
});

export function getPublicSupabaseEnv(): PublicSupabaseEnv | null {
  const parsed = publicSupabaseEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    return null;
  }

  return {
    url: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function requirePublicSupabaseEnv(): PublicSupabaseEnv {
  const env = getPublicSupabaseEnv();

  if (!env) {
    throw new Error(
      "Supabase public env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before using Supabase auth or account features."
    );
  }

  return env;
}

export function getSupabaseServiceRoleKey() {
  const parsed = serverSecretSchema.safeParse(process.env);

  if (!parsed.success) {
    return null;
  }

  return parsed.data.SUPABASE_SERVICE_ROLE_KEY;
}

export function requireSupabaseServiceRoleKey() {
  const key = getSupabaseServiceRoleKey();

  if (!key) {
    throw new Error(
      "Supabase service role env is missing. Set SUPABASE_SERVICE_ROLE_KEY before using admin/server Supabase actions."
    );
  }

  return key;
}

export function getAppSigningSecret() {
  const parsed = signingSecretSchema.safeParse(process.env);

  if (!parsed.success) {
    return null;
  }

  return parsed.data.APP_SIGNING_SECRET?.trim() || parsed.data.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

export function requireAppSigningSecret() {
  const secret = getAppSigningSecret();

  if (!secret) {
    throw new Error(
      "Signing secret env is missing. Set APP_SIGNING_SECRET (recommended) or SUPABASE_SERVICE_ROLE_KEY before using signed checkout session protection."
    );
  }

  return secret;
}
