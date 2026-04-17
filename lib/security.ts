import type { NextResponse } from "next/server";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __ckkoreaRateLimitStore: Map<string, RateLimitBucket> | undefined;
}

function getRateLimitStore() {
  if (!globalThis.__ckkoreaRateLimitStore) {
    globalThis.__ckkoreaRateLimitStore = new Map();
  }

  return globalThis.__ckkoreaRateLimitStore;
}

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",");
    if (firstIp?.trim()) {
      return firstIp.trim();
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) {
    return realIp.trim();
  }

  return "unknown";
}

export function applyRateLimit(options: RateLimitOptions) {
  const store = getRateLimitStore();
  const now = Date.now();
  const current = store.get(options.key);

  if (!current || current.resetAt <= now) {
    store.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      ok: true,
      remaining: Math.max(options.limit - 1, 0),
      resetAt: now + options.windowMs,
    };
  }

  if (current.count >= options.limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count += 1;
  store.set(options.key, current);

  return {
    ok: true,
    remaining: Math.max(options.limit - current.count, 0),
    resetAt: current.resetAt,
  };
}

export function getRequestOrigin(request: Request) {
  return request.headers.get("origin") || request.headers.get("referer");
}

function getRequestHost(request: Request) {
  return (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    null
  );
}

export function isSameOriginRequest(request: Request) {
  const originValue = getRequestOrigin(request);
  const host = getRequestHost(request);

  if (!originValue || !host) {
    return false;
  }

  try {
    const origin = new URL(originValue);
    return origin.host === host;
  } catch {
    return false;
  }
}

export function logServerError(
  scope: string,
  error: unknown,
  extra?: Record<string, unknown>
) {
  const payload: Record<string, unknown> = {
    scope,
    ...(extra ?? {}),
  };

  if (error instanceof Error) {
    payload.errorName = error.name;
    payload.errorMessage = error.message;
  } else {
    payload.error = String(error);
  }

  console.error("[server-error]", payload);
}

export function setNoStoreHeaders(response: NextResponse) {
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}
