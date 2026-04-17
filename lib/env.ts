type PublicSupabaseEnv = {
  url: string;
  anonKey: string;
};

function readTrimmedEnv(name: string) {
  const value = process.env[name];
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv | null {
  const url = readTrimmedEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readTrimmedEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
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
  return readTrimmedEnv("SUPABASE_SERVICE_ROLE_KEY");
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
