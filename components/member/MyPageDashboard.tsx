"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import ProductImage from "@/components/ProductImage";
import { useShopper } from "@/components/ShopperProvider";
import type { AccountSummary, OrderRecord, Product, QuoteRequestRecord, SavedAddress } from "@/lib/types";
import { formatPhoneNumber, formatPrice } from "@/lib/utils";

type AddressFormState = {
  id?: string;
  label: string;
  recipientName: string;
  phone: string;
  zipcode: string;
  address: string;
  detailAddress: string;
  deliveryMemo: string;
  siteName: string;
  isDefault: boolean;
};

const emptyAddressForm: AddressFormState = {
  label: "기본 배송지",
  recipientName: "",
  phone: "",
  zipcode: "",
  address: "",
  detailAddress: "",
  deliveryMemo: "",
  siteName: "",
  isDefault: false,
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function findReorderableProduct(products: Product[], item: OrderRecord["items"][number]) {
  return (
    products.find((product) => product.id === item.productId) ??
    products.find((product) => product.slug === item.slug) ??
    null
  );
}

export default function MyPageDashboard() {
  const router = useRouter();
  const { addToCart, clearCart } = useCart();
  const {
    profile,
    addresses,
    isLoggedIn,
    isBusinessMember,
    businessApproved,
    loading,
    toggleFavorite,
    reloadAccount,
  } = useShopper();
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [message, setMessage] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    defaultAddress: "",
    defaultDetailAddress: "",
    zipcode: "",
    receiveMarketing: false,
    preferredPaymentMethod: "",
    companyName: "",
    businessNumber: "",
    taxEmail: "",
    businessAddress: "",
    businessDetailAddress: "",
    managerName: "",
    managerPhone: "",
    businessType: "",
    businessItem: "",
    bulkPurchaseEnabled: false,
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    setProfileForm({
      name: profile.name,
      phone: profile.phone,
      defaultAddress: profile.defaultAddress,
      defaultDetailAddress: profile.defaultDetailAddress,
      zipcode: profile.zipcode,
      receiveMarketing: profile.receiveMarketing,
      preferredPaymentMethod: profile.preferredPaymentMethod,
      companyName: profile.companyName,
      businessNumber: profile.businessNumber,
      taxEmail: profile.taxEmail,
      businessAddress: profile.businessAddress,
      businessDetailAddress: profile.businessDetailAddress,
      managerName: profile.managerName,
      managerPhone: profile.managerPhone,
      businessType: profile.businessType,
      businessItem: profile.businessItem,
      bulkPurchaseEnabled: profile.bulkPurchaseEnabled,
    });
  }, [profile]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const fetchSummary = async () => {
      try {
        const response = await fetch("/api/account/summary", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "마이페이지 정보를 불러오지 못했습니다.");
        }

        setSummary(data.summary as AccountSummary);
      } catch (error) {
        console.error("MYPAGE SUMMARY LOAD ERROR:", error);
        setMessage(
          error instanceof Error
            ? error.message
            : "마이페이지 정보를 불러오는 중 오류가 발생했습니다."
        );
      }
    };

    void fetchSummary();
  }, [isLoggedIn]);

  const orderStats = useMemo(() => {
    const orders = summary?.orders ?? [];
    return {
      total: orders.length,
      paid: orders.filter((order) => order.status === "DONE").length,
      pending: orders.filter((order) => order.status === "READY").length,
      totalAmount: orders.reduce((sum, order) => sum + (order.amount ?? 0), 0),
    };
  }, [summary]);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "회원 정보 저장에 실패했습니다.");
      }

      await reloadAccount();
      setMessage("회원 정보가 저장되었습니다.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "회원 정보 저장 중 오류가 발생했습니다."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddressSave = async () => {
    setAddressSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/account/addresses", {
        method: addressForm.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "배송지 저장에 실패했습니다.");
      }

      setAddressForm(emptyAddressForm);
      await reloadAccount();
      const summaryResponse = await fetch("/api/account/summary", { cache: "no-store" });
      const summaryData = await summaryResponse.json();
      if (summaryResponse.ok) {
        setSummary(summaryData.summary as AccountSummary);
      }
      setMessage("배송지가 저장되었습니다.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "배송지 저장 중 오류가 발생했습니다."
      );
    } finally {
      setAddressSaving(false);
    }
  };

  const handleAddressDelete = async (addressId: string) => {
    if (!window.confirm("이 배송지를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/account/addresses?id=${encodeURIComponent(addressId)}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "배송지 삭제에 실패했습니다.");
      }

      await reloadAccount();
      setSummary((prev) =>
        prev
          ? {
              ...prev,
              addresses: prev.addresses.filter((address) => address.id !== addressId),
            }
          : prev
      );
      setMessage("배송지가 삭제되었습니다.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "배송지 삭제 중 오류가 발생했습니다."
      );
    }
  };

  const handleAddressEdit = (address: SavedAddress) => {
    setAddressForm({
      id: address.id,
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      zipcode: address.zipcode,
      address: address.address,
      detailAddress: address.detailAddress,
      deliveryMemo: address.deliveryMemo,
      siteName: address.siteName,
      isDefault: address.isDefault,
    });
  };

  const handleReorder = async (order: OrderRecord) => {
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !Array.isArray(data?.products)) {
        throw new Error("재주문용 상품 정보를 불러오지 못했습니다.");
      }

      const currentProducts = data.products as Product[];
      const reorderableProducts = order.items
        .map((item) => ({
          item,
          product: findReorderableProduct(currentProducts, item),
        }))
        .filter(
          (entry): entry is { item: OrderRecord["items"][number]; product: Product } => {
            return entry.product !== null && entry.product.price !== null;
          }
        );

      if (reorderableProducts.length === 0) {
        setMessage("현재 재주문 가능한 상품이 없습니다.");
        return;
      }

      clearCart();
      reorderableProducts.forEach((entry) => addToCart(entry.product, entry.item.quantity));
      router.push("/cart");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "재주문 준비 중 오류가 발생했습니다."
      );
    }
  };

  if (loading && !summary) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        마이페이지 정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,#1e293b_0%,#0f172a_46%,#020617_100%)] px-7 py-8 text-white shadow-xl shadow-slate-300/30">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold">
              {isBusinessMember ? "사업자회원" : "개인회원"}
            </span>
            {isBusinessMember ? (
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold">
                승인 상태: {businessApproved ? "승인 완료" : profile?.businessStatus || "pending"}
              </span>
            ) : null}
          </div>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight">
            {profile?.name || "회원"}님의
            <br />
            마이페이지
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            배송지 저장, 주문내역 확인, 관심상품, 최근 본 상품, 재주문까지 한 곳에서
            관리할 수 있습니다. {isBusinessMember
              ? "사업자회원은 세금계산서와 대량구매 문의 흐름까지 함께 확인할 수 있습니다."
              : "사업자회원으로 전환하면 반복 발주와 대량구매 상담이 더 편리해집니다."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">주문</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{orderStats.total}</div>
            <div className="mt-2 text-sm text-slate-500">
              결제완료 {orderStats.paid}건 / 진행중 {orderStats.pending}건
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">누적 구매금액</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {formatPrice(orderStats.totalAmount)}
            </div>
            <div className="mt-2 text-sm text-slate-500">재주문과 반복 구매를 빠르게 이어갈 수 있습니다.</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">저장 배송지</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{addresses.length}</div>
            <div className="mt-2 text-sm text-slate-500">최근 사용 배송지를 주문서에 자동 반영합니다.</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">관심 / 최근 본</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {summary?.favoriteProducts.length ?? 0} / {summary?.recentlyViewedProducts.length ?? 0}
            </div>
            <div className="mt-2 text-sm text-slate-500">자주 찾는 품목을 빠르게 다시 주문할 수 있습니다.</div>
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      {summary?.setupMessage ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {summary.setupMessage}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-slate-900">내 정보</h2>
            {isBusinessMember ? (
              <Link href="/business-benefits" className="text-sm font-semibold text-slate-700 hover:text-slate-950">
                사업자 혜택 보기
              </Link>
            ) : (
              <Link href="/business-benefits" className="text-sm font-semibold text-slate-700 hover:text-slate-950">
                사업자회원 전환 혜택
              </Link>
            )}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input value={profileForm.name} onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="이름" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
            <input value={profileForm.phone} onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="연락처" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
            <input value={profileForm.zipcode} onChange={(e) => setProfileForm((prev) => ({ ...prev, zipcode: e.target.value }))} placeholder="우편번호" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
            <input value={profileForm.defaultAddress} onChange={(e) => setProfileForm((prev) => ({ ...prev, defaultAddress: e.target.value }))} placeholder="기본 배송지" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
            <input value={profileForm.defaultDetailAddress} onChange={(e) => setProfileForm((prev) => ({ ...prev, defaultDetailAddress: e.target.value }))} placeholder="상세주소" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none md:col-span-2" />
            <select value={profileForm.preferredPaymentMethod} onChange={(e) => setProfileForm((prev) => ({ ...prev, preferredPaymentMethod: e.target.value }))} className="rounded-2xl border border-slate-300 px-4 py-3 outline-none">
              <option value="">선호 결제방식 선택</option>
              <option value="CARD">카드</option>
              <option value="EASY_PAY">간편결제</option>
              <option value="BANK_TRANSFER">무통장입금</option>
            </select>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
              <input type="checkbox" checked={profileForm.receiveMarketing} onChange={(e) => setProfileForm((prev) => ({ ...prev, receiveMarketing: e.target.checked }))} />
              신규 상품 / 배송 / 혜택 안내 받기
            </label>
          </div>

          {isBusinessMember ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input value={profileForm.companyName} onChange={(e) => setProfileForm((prev) => ({ ...prev, companyName: e.target.value }))} placeholder="회사명" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
              <input value={profileForm.businessNumber} onChange={(e) => setProfileForm((prev) => ({ ...prev, businessNumber: e.target.value }))} placeholder="사업자등록번호" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
              <input value={profileForm.managerName} onChange={(e) => setProfileForm((prev) => ({ ...prev, managerName: e.target.value }))} placeholder="담당자명" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
              <input value={profileForm.managerPhone} onChange={(e) => setProfileForm((prev) => ({ ...prev, managerPhone: e.target.value }))} placeholder="담당자 연락처" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
              <input value={profileForm.taxEmail} onChange={(e) => setProfileForm((prev) => ({ ...prev, taxEmail: e.target.value }))} placeholder="세금계산서 이메일" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
              <input value={profileForm.businessAddress} onChange={(e) => setProfileForm((prev) => ({ ...prev, businessAddress: e.target.value }))} placeholder="회사 주소" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
              <input value={profileForm.businessDetailAddress} onChange={(e) => setProfileForm((prev) => ({ ...prev, businessDetailAddress: e.target.value }))} placeholder="회사 상세주소" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
              <input value={profileForm.businessType} onChange={(e) => setProfileForm((prev) => ({ ...prev, businessType: e.target.value }))} placeholder="업태" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
              <input value={profileForm.businessItem} onChange={(e) => setProfileForm((prev) => ({ ...prev, businessItem: e.target.value }))} placeholder="업종" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
              <label className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-800">
                <input type="checkbox" checked={profileForm.bulkPurchaseEnabled} onChange={(e) => setProfileForm((prev) => ({ ...prev, bulkPurchaseEnabled: e.target.checked }))} />
                대량구매 / 반복발주 혜택 우선 안내 받기
              </label>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void handleProfileSave()}
            disabled={profileSaving}
            className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {profileSaving ? "저장 중..." : "내 정보 저장"}
          </button>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">회원 혜택 요약</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                회원은 주문자 정보와 배송지를 저장해 다음 주문 때 입력 칸을 크게 줄일 수 있습니다.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                관심상품과 최근 본 상품이 저장되어 철물/건재/공구 반복 구매 품목을 더 빠르게 다시 찾을 수 있습니다.
              </div>
              {isBusinessMember ? (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  사업자회원은 승인 상태, 세금계산서 이메일, 대량구매 성향을 함께 관리하고 재주문/견적문의 흐름을 더 빠르게 이어갈 수 있습니다.
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  사업자회원으로 전환하면 대량구매 별도 견적, 현장 납품 상담, 반복 발주 대응 혜택 UI를 이용할 수 있습니다.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">최근 저장 배송지</h2>
            <div className="mt-4 space-y-3">
              {addresses.length > 0 ? (
                addresses.slice(0, 3).map((address) => (
                  <div key={address.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {address.label} {address.isDefault ? "(기본)" : ""}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {address.recipientName} · {formatPhoneNumber(address.phone)}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          [{address.zipcode}] {address.address} {address.detailAddress}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddressEdit(address)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                      >
                        수정
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  아직 저장된 배송지가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="addresses" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-slate-900">배송지 관리</h2>
          {addressForm.id ? (
            <button
              type="button"
              onClick={() => setAddressForm(emptyAddressForm)}
              className="text-sm font-semibold text-slate-700"
            >
              새 배송지 작성
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input value={addressForm.label} onChange={(e) => setAddressForm((prev) => ({ ...prev, label: e.target.value }))} placeholder="배송지명" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
          <input value={addressForm.recipientName} onChange={(e) => setAddressForm((prev) => ({ ...prev, recipientName: e.target.value }))} placeholder="수령인" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
          <input value={addressForm.phone} onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="연락처" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
          <input value={addressForm.zipcode} onChange={(e) => setAddressForm((prev) => ({ ...prev, zipcode: e.target.value }))} placeholder="우편번호" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
          <input value={addressForm.address} onChange={(e) => setAddressForm((prev) => ({ ...prev, address: e.target.value }))} placeholder="주소" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none md:col-span-2" />
          <input value={addressForm.detailAddress} onChange={(e) => setAddressForm((prev) => ({ ...prev, detailAddress: e.target.value }))} placeholder="상세주소" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none md:col-span-2" />
          <input value={addressForm.siteName} onChange={(e) => setAddressForm((prev) => ({ ...prev, siteName: e.target.value }))} placeholder="현장명 / 납품처명" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
          <input value={addressForm.deliveryMemo} onChange={(e) => setAddressForm((prev) => ({ ...prev, deliveryMemo: e.target.value }))} placeholder="배송메모" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none" />
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 md:col-span-2">
            <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))} />
            기본 배송지로 저장
          </label>
        </div>

        <button
          type="button"
          onClick={() => void handleAddressSave()}
          disabled={addressSaving}
          className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {addressSaving ? "저장 중..." : addressForm.id ? "배송지 수정" : "배송지 추가"}
        </button>

        {addresses.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <div key={address.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {address.label} {address.isDefault ? "(기본)" : ""}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {address.recipientName} · {formatPhoneNumber(address.phone)}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      [{address.zipcode}] {address.address} {address.detailAddress}
                    </div>
                    {address.siteName ? (
                      <div className="mt-1 text-sm text-slate-500">현장명: {address.siteName}</div>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleAddressEdit(address)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900">
                      수정
                    </button>
                    <button type="button" onClick={() => void handleAddressDelete(address.id)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-red-600">
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div id="favorites" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">관심상품</h2>
          <div className="mt-5 grid gap-4">
            {summary?.favoriteProducts.length ? (
              summary.favoriteProducts.slice(0, 6).map((product) => (
                <div key={product.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-4">
                    <Link href={`/products/${product.slug}`} className="relative block h-24 w-24 overflow-hidden rounded-2xl bg-white">
                      <ProductImage src={product.image} alt={product.name} fill className="object-cover" sizes="96px" />
                    </Link>
                    <div className="flex-1">
                      <Link href={`/products/${product.slug}`} className="font-semibold text-slate-900 hover:underline">
                        {product.name}
                      </Link>
                      <div className="mt-1 text-sm text-slate-600">{product.spec} · {product.shipping}</div>
                      <div className="mt-2 text-lg font-black text-slate-900">{formatPrice(product.price)}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link href={`/order?product=${product.slug}&quantity=${product.minimumOrderQuantity}`} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white">
                          바로구매
                        </Link>
                        <button type="button" onClick={() => void toggleFavorite(product.id)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900">
                          관심 해제
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                아직 저장된 관심상품이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div id="recent" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">최근 본 상품</h2>
          <div className="mt-5 grid gap-4">
            {summary?.recentlyViewedProducts.length ? (
              summary.recentlyViewedProducts.slice(0, 6).map((product) => (
                <div key={product.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-4">
                    <Link href={`/products/${product.slug}`} className="relative block h-24 w-24 overflow-hidden rounded-2xl bg-white">
                      <ProductImage src={product.image} alt={product.name} fill className="object-cover" sizes="96px" />
                    </Link>
                    <div className="flex-1">
                      <Link href={`/products/${product.slug}`} className="font-semibold text-slate-900 hover:underline">
                        {product.name}
                      </Link>
                      <div className="mt-1 text-sm text-slate-600">{product.spec} · {product.shipping}</div>
                      <div className="mt-2 text-lg font-black text-slate-900">{formatPrice(product.price)}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link href={`/products/${product.slug}`} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900">
                          다시 보기
                        </Link>
                        <Link href={`/order?product=${product.slug}&quantity=${product.minimumOrderQuantity}`} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white">
                          빠른 주문
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                최근 본 상품이 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div id="orders" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">주문 내역 / 재주문</h2>
          <div className="mt-5 space-y-4">
            {summary?.orders.length ? (
              summary.orders.map((order) => (
                <div key={order.order_id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-slate-900">{order.order_name}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {formatDateTime(order.created_at)} · {order.status} · {formatPrice(order.amount)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleReorder(order)}
                      className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
                    >
                      재주문 담기
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item) => (
                      <Link
                        key={`${order.order_id}-${item.productId}-${item.slug}`}
                        href={`/products/${item.slug}`}
                        className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        {item.name} {item.quantity}개
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                아직 주문 내역이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div id="quotes" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">견적 / 사업자 문의 내역</h2>
          <div className="mt-5 space-y-4">
            {summary?.quotes.length ? (
              summary.quotes.map((quote: QuoteRequestRecord) => (
                <div key={String(quote.id)} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="font-semibold text-slate-900">{quote.product_name || "상품 지정 없음"}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {formatDateTime(quote.created_at)} · {quote.status}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    {quote.message}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                아직 견적문의 내역이 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
