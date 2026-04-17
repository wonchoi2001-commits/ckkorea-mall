import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { requireAppSigningSecret } from "@/lib/env";

export const CHECKOUT_SESSION_COOKIE = "ckkorea_checkout";
const CHECKOUT_SESSION_MAX_AGE = 60 * 60 * 2;

type CheckoutSessionPayload = {
  orderId: string;
  amount: number;
  issuedAt: number;
};

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", requireAppSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createCheckoutSessionToken(orderId: string, amount: number) {
  const payload: CheckoutSessionPayload = {
    orderId,
    amount,
    issuedAt: Date.now(),
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyCheckoutSessionToken(
  token: string | null | undefined,
  expected: { orderId: string; amount?: number }
) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const isValidSignature =
    expectedSignature.length === signature.length &&
    timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));

  if (!isValidSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(
      decodeBase64Url(encodedPayload)
    ) as CheckoutSessionPayload;

    if (payload.orderId !== expected.orderId) {
      return null;
    }

    if (
      typeof expected.amount === "number" &&
      Number(payload.amount) !== Number(expected.amount)
    ) {
      return null;
    }

    if (Date.now() - payload.issuedAt > CHECKOUT_SESSION_MAX_AGE * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getCheckoutSessionTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(CHECKOUT_SESSION_COOKIE)?.value ?? null;
}

export function attachCheckoutSessionCookie(
  response: NextResponse,
  params: { orderId: string; amount: number }
) {
  response.cookies.set({
    name: CHECKOUT_SESSION_COOKIE,
    value: createCheckoutSessionToken(params.orderId, params.amount),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CHECKOUT_SESSION_MAX_AGE,
  });

  return response;
}

export function clearCheckoutSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: CHECKOUT_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
