import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function normalizeAdminEmails(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isExampleAdminEmail(email: string) {
  return email.endsWith("@example.com");
}

export function getConfiguredAdminEmails() {
  return Array.from(
    new Set([
      ...normalizeAdminEmails(process.env.ADMIN_EMAILS),
      ...normalizeAdminEmails(process.env.ADMIN_EMAIL),
    ])
  );
}

export function hasOnlyExampleAdminEmails() {
  const adminEmails = getConfiguredAdminEmails();

  return (
    adminEmails.length > 0 && adminEmails.every((email) => isExampleAdminEmail(email))
  );
}

export function isDevelopmentAdminBypassEnabled() {
  return process.env.NODE_ENV !== "production" && hasOnlyExampleAdminEmails();
}

function getAdminEmailSet() {
  return new Set(getConfiguredAdminEmails());
}

export function isAdminUser(user: User | null | undefined) {
  if (!user) {
    return false;
  }

  if (isDevelopmentAdminBypassEnabled()) {
    return true;
  }

  const role = user.app_metadata?.role;

  if (role === "admin") {
    return true;
  }

  const email = user.email?.trim().toLowerCase();

  if (!email) {
    return false;
  }

  return getAdminEmailSet().has(email);
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getAdminUser() {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    return null;
  }

  return user;
}

export async function requireAdminUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdminUser(user)) {
    redirect("/admin/login?error=access-denied");
  }

  return user;
}

export async function requireSignedInUser(redirectTo = "/login") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}
