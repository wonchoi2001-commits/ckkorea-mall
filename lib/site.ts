const LOCAL_FALLBACK_SITE_URL = "http://127.0.0.1:3001";

function normalizeSiteOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return LOCAL_FALLBACK_SITE_URL;
  }
}

export function getSiteOrigin() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  // Final production domain is not connected yet, so we intentionally fall back
  // to a local origin instead of inventing a public domain.
  return raw ? normalizeSiteOrigin(raw) : LOCAL_FALLBACK_SITE_URL;
}

export function getMetadataBase() {
  return new URL(getSiteOrigin());
}

export function buildSiteUrl(path = "/") {
  const origin = getSiteOrigin();

  if (!path || path === "/") {
    return origin;
  }

  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getRuntimeSiteOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return getSiteOrigin();
}

export function hasConfiguredPublicSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!raw) {
    return false;
  }

  const origin = normalizeSiteOrigin(raw);

  return !origin.includes("127.0.0.1") && !origin.includes("localhost");
}
