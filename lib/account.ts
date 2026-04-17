import type { User } from "@supabase/supabase-js";
import {
  getProductRecordById,
  getProductRecords,
  mapProductRecordToProduct,
} from "@/lib/products";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AccountSummary,
  FavoriteProductRecord,
  MemberProfile,
  MemberProfileRecord,
  RecentlyViewedProductRecord,
  SavedAddress,
  SavedAddressRecord,
} from "@/lib/types";
import { normalizeBusinessNumber, normalizePhoneNumber } from "@/lib/utils";

function normalizeText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function isMissingMemberTablesError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "42P01"
  );
}

function mapProfileRecordToProfile(record: MemberProfileRecord | null): MemberProfile | null {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    role: record.role ?? "personal",
    name: normalizeText(record.name),
    email: normalizeText(record.email),
    phone: normalizePhoneNumber(record.phone),
    defaultAddress: normalizeText(record.default_address),
    defaultDetailAddress: normalizeText(record.default_detail_address),
    zipcode: normalizeText(record.zipcode),
    receiveMarketing: record.receive_marketing === true,
    isActive: record.is_active !== false,
    companyName: normalizeText(record.company_name),
    businessNumber: normalizeBusinessNumber(record.business_number),
    businessStatus: record.business_status ?? "pending",
    taxEmail: normalizeText(record.tax_email),
    businessAddress: normalizeText(record.business_address),
    businessDetailAddress: normalizeText(record.business_detail_address),
    managerName: normalizeText(record.manager_name),
    managerPhone: normalizePhoneNumber(record.manager_phone),
    businessType: normalizeText(record.business_type),
    businessItem: normalizeText(record.business_item),
    bulkPurchaseEnabled: record.bulk_purchase_enabled === true,
    businessDiscountRate:
      typeof record.business_discount_rate === "number" ? record.business_discount_rate : 0,
    memo: normalizeText(record.memo),
    preferredPaymentMethod: normalizeText(record.preferred_payment_method),
    savedDeliveryRequests: Array.isArray(record.saved_delivery_requests)
      ? record.saved_delivery_requests
      : [],
    orderCount: typeof record.order_count === "number" ? record.order_count : 0,
    totalPurchaseAmount:
      typeof record.total_purchase_amount === "number" ? record.total_purchase_amount : 0,
    favoriteCategories: Array.isArray(record.favorite_categories)
      ? record.favorite_categories
      : [],
    createdAt: record.created_at ?? null,
    updatedAt: record.updated_at ?? null,
  };
}

function mapAddressRecordToAddress(record: SavedAddressRecord): SavedAddress {
  return {
    id: String(record.id),
    userId: record.user_id,
    label: normalizeText(record.label) || "배송지",
    recipientName: normalizeText(record.recipient_name),
    phone: normalizePhoneNumber(record.phone),
    zipcode: normalizeText(record.zipcode),
    address: normalizeText(record.address),
    detailAddress: normalizeText(record.detail_address),
    deliveryMemo: normalizeText(record.delivery_memo),
    siteName: normalizeText(record.site_name),
    isDefault: record.is_default === true,
    createdAt: record.created_at ?? null,
    updatedAt: record.updated_at ?? null,
  };
}

function buildFallbackProfileRecord(user: User): MemberProfileRecord {
  const memberType =
    user.app_metadata?.role === "admin"
      ? "admin"
      : user.user_metadata?.memberType === "business"
        ? "business"
        : "personal";

  return {
    id: user.id,
    role: memberType,
    name: normalizeText(user.user_metadata?.name as string | undefined),
    email: user.email ?? "",
    phone: normalizePhoneNumber(user.user_metadata?.phone as string | undefined),
    company_name: normalizeText(user.user_metadata?.companyName as string | undefined),
    business_number: normalizeBusinessNumber(
      user.user_metadata?.businessNumber as string | undefined
    ),
    business_status: memberType === "business" ? "pending" : "approved",
    tax_email: normalizeText(user.user_metadata?.taxEmail as string | undefined),
    business_address: normalizeText(
      user.user_metadata?.businessAddress as string | undefined
    ),
    business_detail_address: normalizeText(
      user.user_metadata?.businessDetailAddress as string | undefined
    ),
    manager_name: normalizeText(user.user_metadata?.managerName as string | undefined),
    manager_phone: normalizePhoneNumber(user.user_metadata?.managerPhone as string | undefined),
    business_type: normalizeText(user.user_metadata?.businessType as string | undefined),
    business_item: normalizeText(user.user_metadata?.businessItem as string | undefined),
    bulk_purchase_enabled: user.user_metadata?.bulkPurchaseEnabled === true,
    receive_marketing: user.user_metadata?.receiveMarketing === true,
    is_active: true,
  };
}

function buildProfileUpsertPayload(
  user: User,
  payload?: Partial<MemberProfileRecord>
): MemberProfileRecord {
  const fallback = buildFallbackProfileRecord(user);

  return {
    ...fallback,
    ...payload,
    id: user.id,
    email: payload?.email ?? fallback.email,
  };
}

async function getCurrentAuthUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAccountUser() {
  const user = await getCurrentAuthUser();

  if (!user) {
    return null;
  }

  return user;
}

export async function ensureMemberProfile(user: User) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return mapProfileRecordToProfile(data as MemberProfileRecord);
  }

  const fallback = buildProfileUpsertPayload(user);
  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .upsert([fallback], { onConflict: "id" })
    .select("*")
    .single();

  if (insertError) {
    throw insertError;
  }

  return mapProfileRecordToProfile(inserted as MemberProfileRecord);
}

export async function getMemberProfile(user: User) {
  return ensureMemberProfile(user);
}

export async function updateMemberProfile(
  user: User,
  payload: Partial<MemberProfileRecord>
) {
  const supabase = createAdminSupabaseClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const dataToSave = {
    ...(existing ? (existing as MemberProfileRecord) : buildFallbackProfileRecord(user)),
    ...payload,
    id: user.id,
    email: payload.email ?? user.email ?? "",
  };
  const { data, error } = await supabase
    .from("profiles")
    .upsert([dataToSave], { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapProfileRecordToProfile(data as MemberProfileRecord);
}

export async function getSavedAddresses(userId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("saved_addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as SavedAddressRecord[]).map(mapAddressRecordToAddress);
}

export async function saveAddress(
  userId: string,
  payload: Partial<SavedAddressRecord> & { id?: string }
) {
  const supabase = createAdminSupabaseClient();
  const dataToSave = {
    ...(payload.id ? { id: payload.id } : {}),
    user_id: userId,
    label: normalizeText(payload.label) || "배송지",
    recipient_name: normalizeText(payload.recipient_name),
    phone: normalizePhoneNumber(payload.phone),
    zipcode: normalizeText(payload.zipcode),
    address: normalizeText(payload.address),
    detail_address: normalizeText(payload.detail_address),
    delivery_memo: normalizeText(payload.delivery_memo),
    site_name: normalizeText(payload.site_name),
    is_default: payload.is_default === true,
  };

  const { data, error } = await supabase
    .from("saved_addresses")
    .upsert([dataToSave], { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapAddressRecordToAddress(data as SavedAddressRecord);
}

export async function deleteSavedAddress(userId: string, addressId: string) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("saved_addresses")
    .delete()
    .eq("user_id", userId)
    .eq("id", addressId);

  if (error) {
    throw error;
  }
}

async function mapProductsByIds(ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  const records = await getProductRecords();
  const productMap = new Map(
    records.map((record) => [String(record.id), mapProductRecordToProduct(record)])
  );

  return ids
    .map((id) => productMap.get(String(id)) ?? null)
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
}

export async function getFavoriteProducts(userId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("favorite_products")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as FavoriteProductRecord[];

  return mapProductsByIds(rows.map((row) => row.product_id));
}

export async function addFavoriteProduct(userId: string, productId: string) {
  const product = await getProductRecordById(productId);

  if (!product || product.is_active === false) {
    throw new Error("상품을 찾을 수 없습니다.");
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("favorite_products")
    .upsert([{ user_id: userId, product_id: productId }], {
      onConflict: "user_id,product_id",
      ignoreDuplicates: true,
    });

  if (error) {
    throw error;
  }
}

export async function removeFavoriteProduct(userId: string, productId: string) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("favorite_products")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    throw error;
  }
}

export async function mergeFavoriteProducts(userId: string, productIds: string[]) {
  for (const productId of Array.from(new Set(productIds))) {
    await addFavoriteProduct(userId, productId);
  }
}

export async function getRecentlyViewedProducts(userId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("recently_viewed_products")
    .select("*")
    .eq("user_id", userId)
    .order("last_viewed_at", { ascending: false })
    .limit(24);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as RecentlyViewedProductRecord[];

  return mapProductsByIds(rows.map((row) => row.product_id));
}

export async function recordRecentlyViewedProduct(userId: string, productId: string) {
  const product = await getProductRecordById(productId);

  if (!product || product.is_active === false) {
    throw new Error("상품을 찾을 수 없습니다.");
  }

  const supabase = createAdminSupabaseClient();
  const { data: existing, error: readError } = await supabase
    .from("recently_viewed_products")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  const nextCount =
    existing && typeof existing === "object" && "view_count" in existing
      ? Number(existing.view_count ?? 0) + 1
      : 1;

  const { error } = await supabase.from("recently_viewed_products").upsert(
    [
      {
        user_id: userId,
        product_id: productId,
        last_viewed_at: new Date().toISOString(),
        view_count: nextCount,
      },
    ],
    { onConflict: "user_id,product_id" }
  );

  if (error) {
    throw error;
  }
}

export async function mergeRecentlyViewedProducts(userId: string, productIds: string[]) {
  for (const productId of Array.from(new Set(productIds)).slice(0, 24)) {
    await recordRecentlyViewedProduct(userId, productId);
  }
}

export async function getMemberOrders(user: User) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_email", user.email ?? "")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getMemberQuotes(user: User) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("email", user.email ?? "")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function buildAccountSummary(user: User): Promise<AccountSummary> {
  const summary: AccountSummary = {
    profile: null,
    addresses: [],
    favoriteProducts: [],
    recentlyViewedProducts: [],
    orders: [],
    quotes: [],
    setupMessage: null,
  };

  try {
    summary.profile = await ensureMemberProfile(user);
    summary.addresses = await getSavedAddresses(user.id);
    summary.favoriteProducts = await getFavoriteProducts(user.id);
    summary.recentlyViewedProducts = await getRecentlyViewedProducts(user.id);
  } catch (error) {
    if (isMissingMemberTablesError(error)) {
      summary.setupMessage =
        "member_schema.sql이 아직 적용되지 않아 회원 저장 기능 일부가 비활성화되어 있습니다.";
    } else {
      throw error;
    }
  }

  try {
    summary.orders = (await getMemberOrders(user)) as AccountSummary["orders"];
  } catch (error) {
    console.error("ACCOUNT ORDERS LOAD ERROR:", error);
  }

  try {
    summary.quotes = (await getMemberQuotes(user)) as AccountSummary["quotes"];
  } catch (error) {
    console.error("ACCOUNT QUOTES LOAD ERROR:", error);
  }

  return summary;
}
