export function formatPrice(price: number | null) {
  if (price === null) return "견적문의";
  return `${price.toLocaleString()}원`;
}

export function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "");
}

export function parseKeywordString(value?: string | string[] | null) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizePhoneNumber(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.replace(/[^\d]/g, "");
}

export function normalizeBusinessNumber(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.replace(/[^\d]/g, "");
}

export function formatPhoneNumber(value?: string | null) {
  const digits = normalizePhoneNumber(value);

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return digits;
}
