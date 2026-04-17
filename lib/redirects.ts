export function getSafeRedirectPath(
  redirectTo: string | null | undefined,
  fallback = "/"
) {
  if (!redirectTo) {
    return fallback;
  }

  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(redirectTo, "https://local.ckkorea");

    if (parsed.origin !== "https://local.ckkorea") {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
