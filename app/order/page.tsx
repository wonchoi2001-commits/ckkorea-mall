"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useCart } from "@/components/CartProvider";
import { useShopper } from "@/components/ShopperProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ConsentChecklist from "@/components/legal/ConsentChecklist";
import LegalNoticePanel from "@/components/legal/LegalNoticePanel";
import ProductImage from "@/components/ProductImage";
import { companyInfo, shippingPolicy } from "@/lib/data";
import { orderLegalNoticeItems } from "@/lib/legal-content";
import { getRuntimeSiteOrigin } from "@/lib/site";
import type { Product } from "@/lib/types";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}

function getMinimumOrderQuantity(product: Product | null | undefined) {
  return Math.max(product?.minimumOrderQuantity ?? 1, 1);
}

function clampOrderQuantity(product: Product | null | undefined, quantity: number) {
  const minimum = getMinimumOrderQuantity(product);
  const sanitizedQuantity = Number.isInteger(quantity) && quantity > 0 ? quantity : minimum;

  if (typeof product?.stockQuantity === "number" && product.stockQuantity > 0) {
    return Math.min(Math.max(sanitizedQuantity, minimum), product.stockQuantity);
  }

  return Math.max(sanitizedQuantity, minimum);
}

const sectionClassName = "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm";
const inputClassName =
  "w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900";
const checkboxCardClassName =
  "flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800";

function OrderPageContent() {
  const searchParams = useSearchParams();
  const { cartItems, selectedCartItems } = useCart();
  const { isLoggedIn, isBusinessMember, profile, addresses } = useShopper();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState("");
  const [isOrderItemsExpanded, setIsOrderItemsExpanded] = useState(false);

  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isBusinessOrder, setIsBusinessOrder] = useState(false);
  const [businessNumber, setBusinessNumber] = useState("");
  const [ceoName, setCeoName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessItem, setBusinessItem] = useState("");
  const [projectName, setProjectName] = useState("");
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
  const [taxInvoiceRequested, setTaxInvoiceRequested] = useState(false);
  const [taxInvoiceEmail, setTaxInvoiceEmail] = useState("");

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [deliveryMemo, setDeliveryMemo] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [refundConfirmed, setRefundConfirmed] = useState(false);
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);

  const requestedSource = searchParams.get("source");
  const preferredSlug = searchParams.get("product");
  const preferredQuantity = Number(searchParams.get("quantity") || "1");
  const isCartMode = requestedSource === "cart";
  const orderConsentItems = [
    { id: "order", label: "주문 내용 및 상품 정보를 확인했습니다", href: "/disclaimer", required: true },
    { id: "refund", label: "교환/반품/환불 정책을 확인했습니다", href: "/refund-policy", required: true },
    { id: "privacy", label: "개인정보 수집 및 이용에 동의합니다", href: "/privacy", required: true },
  ] as const;
  const orderConsentValues = {
    order: orderConfirmed,
    refund: refundConfirmed,
    privacy: privacyConfirmed,
  };
  const allOrderConsentsChecked = orderConsentItems.every((item) => orderConsentValues[item.id]);

  const handleOrderConsentToggle = (id: string, checked: boolean) => {
    if (id === "order") {
      setOrderConfirmed(checked);
      return;
    }

    if (id === "refund") {
      setRefundConfirmed(checked);
      return;
    }

    if (id === "privacy") {
      setPrivacyConfirmed(checked);
    }
  };

  const handleOrderConsentToggleAll = (checked: boolean) => {
    setOrderConfirmed(checked);
    setRefundConfirmed(checked);
    setPrivacyConfirmed(checked);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setPageLoading(true);
        setError("");

        const response = await fetch("/api/products", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "상품 목록을 불러오지 못했습니다.");
        }

        const sellableProducts = Array.isArray(data?.products)
          ? (data.products as Product[]).filter(
              (product) =>
                product.price !== null &&
                (product.stockQuantity === null ||
                  product.stockQuantity === undefined ||
                  product.stockQuantity > 0)
            )
          : [];

        setProducts(sellableProducts);

        if (isCartMode) {
          setSelectedId("");
          return;
        }

        if (!preferredSlug) {
          setSelectedId("");
          return;
        }

        const preferredProduct = sellableProducts.find((product) => product.slug === preferredSlug);

        if (!preferredProduct) {
          throw new Error("선택한 상품을 찾을 수 없습니다. 상품 상세에서 다시 주문해주세요.");
        }

        setSelectedId(preferredProduct.id);
        setQuantity(clampOrderQuantity(preferredProduct, preferredQuantity));
      } catch (caughtError) {
        console.error("ORDER PAGE PRODUCTS ERROR:", caughtError);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "상품 목록을 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setPageLoading(false);
      }
    };

    fetchProducts();
  }, [isCartMode, preferredQuantity, preferredSlug]);

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === selectedId) ?? null,
    [products, selectedId]
  );

  useEffect(() => {
    if (!selectedProduct || isCartMode) {
      return;
    }

    setQuantity((current) => clampOrderQuantity(selectedProduct, current));
  }, [isCartMode, selectedProduct]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setBuyerName((prev) => prev || profile.name);
    setBuyerPhone((prev) => prev || profile.phone);
    setBuyerEmail((prev) => prev || profile.email);
    setCompanyName((prev) => prev || profile.companyName);
    setBusinessNumber((prev) => prev || profile.businessNumber);
    setTaxInvoiceEmail((prev) => prev || profile.taxEmail || profile.email);
    setAddress((prev) => prev || profile.defaultAddress);
    setDetailAddress((prev) => prev || profile.defaultDetailAddress);
    setZipCode((prev) => prev || profile.zipcode);
    setReceiverName((prev) => prev || profile.name);
    setReceiverPhone((prev) => prev || profile.phone);

    if (profile.role === "business") {
      setIsBusinessOrder(true);
    }
  }, [profile]);

  useEffect(() => {
    if (addresses.length === 0) {
      return;
    }

    const defaultAddress = addresses.find((addressItem) => addressItem.isDefault) ?? addresses[0];

    if (!defaultAddress) {
      return;
    }

    setSelectedSavedAddressId((prev) => prev || defaultAddress.id);
    setReceiverName((prev) => prev || defaultAddress.recipientName || profile?.name || "");
    setReceiverPhone((prev) => prev || defaultAddress.phone || profile?.phone || "");
    setZipCode((prev) => prev || defaultAddress.zipcode);
    setAddress((prev) => prev || defaultAddress.address);
    setDetailAddress((prev) => prev || defaultAddress.detailAddress);
    setDeliveryMemo((prev) => prev || defaultAddress.deliveryMemo);
  }, [addresses, profile]);

  const cartCheckoutItems = useMemo(() => {
    if (!isCartMode) {
      return [];
    }

    return selectedCartItems
      .map((cartItem) => {
        const currentProduct =
          products.find((product) => product.id === cartItem.product.id) ?? null;

        if (!currentProduct) {
          return null;
        }

        return {
          product: currentProduct,
          quantity: clampOrderQuantity(currentProduct, cartItem.quantity),
        };
      })
      .filter((item): item is { product: Product; quantity: number } => Boolean(item));
  }, [isCartMode, products, selectedCartItems]);

  const unavailableCartItems = useMemo(() => {
    if (!isCartMode) {
      return [];
    }

    return selectedCartItems.filter(
      (cartItem) => !products.some((product) => product.id === cartItem.product.id)
    );
  }, [isCartMode, products, selectedCartItems]);

  const checkoutItems = useMemo(() => {
    if (isCartMode) {
      return cartCheckoutItems;
    }

    return selectedProduct ? [{ product: selectedProduct, quantity }] : [];
  }, [cartCheckoutItems, isCartMode, quantity, selectedProduct]);

  const totalAmount = useMemo(
    () =>
      checkoutItems.reduce(
        (sum, item) => sum + (item.product.price ?? 0) * item.quantity,
        0
      ),
    [checkoutItems]
  );

  const totalQuantity = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.quantity, 0),
    [checkoutItems]
  );

  const selectedSavedAddress = useMemo(
    () => addresses.find((addressItem) => addressItem.id === selectedSavedAddressId) ?? null,
    [addresses, selectedSavedAddressId]
  );

  const handleSavedAddressChange = (addressId: string) => {
    setSelectedSavedAddressId(addressId);

    const savedAddress = addresses.find((addressItem) => addressItem.id === addressId) ?? null;

    if (!savedAddress) {
      return;
    }

    setReceiverName(savedAddress.recipientName || profile?.name || "");
    setReceiverPhone(savedAddress.phone || profile?.phone || "");
    setZipCode(savedAddress.zipcode);
    setAddress(savedAddress.address);
    setDetailAddress(savedAddress.detailAddress);
    setDeliveryMemo(savedAddress.deliveryMemo);
  };

  const handlePayment = async () => {
    try {
      if (checkoutItems.length === 0) {
        alert("주문 가능한 상품이 없습니다.");
        return;
      }

      if (!buyerName || !buyerPhone || !buyerEmail) {
        alert("주문자 정보를 입력해주세요.");
        return;
      }

      if (isBusinessOrder && (!companyName || !businessNumber)) {
        alert("사업자 주문은 회사명과 사업자등록번호를 입력해주세요.");
        return;
      }

      if (taxInvoiceRequested && (!companyName || !businessNumber || !(taxInvoiceEmail || buyerEmail))) {
        alert("세금계산서 요청 시 회사명, 사업자등록번호, 발행 이메일이 필요합니다.");
        return;
      }

      if (!receiverName || !receiverPhone || !zipCode || !address || !detailAddress) {
        alert("배송 정보를 입력해주세요.");
        return;
      }

      if (!orderConfirmed || !refundConfirmed || !privacyConfirmed) {
        alert("결제 전 필수 약관 및 주문 확인 항목에 동의해주세요.");
        return;
      }

      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || getRuntimeSiteOrigin();

      if (!clientKey) {
        alert("NEXT_PUBLIC_TOSS_CLIENT_KEY가 없습니다.");
        return;
      }

      setLoading(true);
      sessionStorage.setItem("ckkorea-checkout-source", isCartMode ? "cart" : "direct");

      const createResponse = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(isCartMode
            ? {
                items: checkoutItems.map((item) => ({
                  productId: item.product.id,
                  quantity: item.quantity,
                })),
              }
            : {
                productId: selectedProduct?.id,
                quantity,
              }),
          customer: {
            name: buyerName,
            phone: buyerPhone,
            email: buyerEmail,
            company: companyName || undefined,
          },
          business:
            isBusinessOrder || taxInvoiceRequested
              ? {
                  isBusinessOrder,
                  companyName: companyName || undefined,
                  businessNumber: businessNumber || undefined,
                  ceoName: ceoName || undefined,
                  businessType: businessType || undefined,
                  businessItem: businessItem || undefined,
                  projectName: projectName || undefined,
                  purchaseOrderNumber: purchaseOrderNumber || undefined,
                  taxInvoiceRequested,
                  taxInvoiceEmail: taxInvoiceRequested
                    ? taxInvoiceEmail || buyerEmail || undefined
                    : undefined,
                }
              : undefined,
          shipping: {
            receiver: receiverName,
            phone: receiverPhone,
            zipCode,
            address1: address,
            address2: detailAddress,
            deliveryMemo: deliveryMemo || undefined,
          },
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        alert(createData?.message || "주문 생성에 실패했습니다.");
        return;
      }

      const tossPayments = await loadTossPayments(clientKey);

      await tossPayments.payment({ customerKey: buyerEmail || createData.orderId }).requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: createData.amount,
        },
        orderId: createData.orderId,
        orderName: createData.orderName,
        successUrl: `${siteUrl}/payments/success`,
        failUrl: `${siteUrl}/payments/fail`,
        customerEmail: buyerEmail,
        customerName: buyerName,
      });
    } catch (caughtError) {
      console.error("TOSS REQUEST PAYMENT ERROR:", caughtError);
      alert("결제창 실행 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Header />
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            상품 정보를 불러오는 중입니다...
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Header />
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-red-600 shadow-sm">
            {error}
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (!products.length) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Header />
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            등록된 즉시결제 상품이 없습니다.
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (isCartMode && selectedCartItems.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Header />
        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-black text-slate-900">선택한 장바구니 상품이 없습니다.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              장바구니에서 주문할 상품을 먼저 선택한 뒤 다시 진행해주세요.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/cart"
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                장바구니로 돌아가기
              </Link>
              <Link
                href="/products"
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                상품 더 보기
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (!isCartMode && !selectedProduct) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Header />
        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-black text-slate-900">주문할 상품이 선택되지 않았습니다.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              상품 상세에서 바로구매를 누르거나, 장바구니에서 선택한 상품으로 주문해주세요.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                상품 보러가기
              </Link>
              <Link
                href="/cart"
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                장바구니 보기
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                주문 / 결제
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {isCartMode ? "장바구니 주문" : "바로구매"}
              </span>
              {isBusinessMember ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  사업자회원 빠른 주문
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
              주문 정보만 빠르게 확인하고 바로 결제하세요
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              주문 페이지에서는 상품을 다시 고르지 않습니다. 지금 선택한 상품만 간단히
              확인한 뒤 주문자 정보와 배송 정보 입력 후 바로 결제로 이어집니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">주문 수량</div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {totalQuantity.toLocaleString()}개
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">예상 결제금액</div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {formatPrice(totalAmount)}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">배송 기준</div>
              <div className="mt-2 text-sm leading-6 text-slate-600">
                기본 {shippingPolicy.baseFee.toLocaleString()}원,{" "}
                {shippingPolicy.freeShippingThreshold.toLocaleString()}원 이상 무료배송
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <section className={sectionClassName}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">주문 상품 요약</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {isCartMode
                      ? "장바구니에서 선택한 상품만 주문서로 넘어왔습니다."
                      : "상품 상세에서 선택한 수량 그대로 결제를 진행합니다."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOrderItemsExpanded((prev) => !prev)}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    {isOrderItemsExpanded ? "요약만 보기" : "상품 자세히 보기"}
                  </button>
                  <Link
                    href={isCartMode ? "/cart" : `/products/${selectedProduct?.slug ?? ""}`}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    {isCartMode ? "장바구니로 돌아가기" : "상품 다시 보기"}
                  </Link>
                </div>
              </div>

              {unavailableCartItems.length > 0 ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  선택한 장바구니 상품 중 일부는 현재 주문 대상에서 제외되었습니다.
                </div>
              ) : null}

              <div className="mt-5 space-y-3">
                {checkoutItems
                  .slice(0, isOrderItemsExpanded ? checkoutItems.length : Math.min(checkoutItems.length, 2))
                  .map((item) => (
                    <div
                      key={`${item.product.id}-${item.quantity}`}
                      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white">
                        <ProductImage
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-slate-900">
                          {item.product.name}
                        </div>
                        <div className="mt-1 truncate text-xs text-slate-500">
                          {item.product.spec || "규격 문의"} · {item.product.shipping}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          수량 {item.quantity}개
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">
                          {formatPrice((item.product.price ?? 0) * item.quantity)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          단가 {formatPrice(item.product.price ?? 0)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {checkoutItems.length > 2 && !isOrderItemsExpanded ? (
                <div className="mt-3 text-xs font-semibold text-slate-500">
                  외 {checkoutItems.length - 2}개 상품은 우측 요약과 상세보기에서 확인할 수 있습니다.
                </div>
              ) : null}

              {!isCartMode && selectedProduct ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-500">주문 수량</div>
                      <div className="mt-1 text-xs text-slate-500">
                        최소 {getMinimumOrderQuantity(selectedProduct).toLocaleString()}개부터 주문
                        가능합니다.
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((prev) =>
                            Math.max(getMinimumOrderQuantity(selectedProduct), prev - 1)
                          )
                        }
                        className="h-11 w-11 rounded-2xl border border-slate-300 bg-white text-lg font-bold"
                      >
                        -
                      </button>
                      <div className="flex h-11 min-w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-bold text-slate-900">
                        {quantity}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((prev) =>
                            selectedProduct.stockQuantity && selectedProduct.stockQuantity > 0
                              ? Math.min(
                                  Math.max(prev + 1, getMinimumOrderQuantity(selectedProduct)),
                                  selectedProduct.stockQuantity
                                )
                              : Math.max(prev + 1, getMinimumOrderQuantity(selectedProduct))
                          )
                        }
                        className="h-11 w-11 rounded-2xl border border-slate-300 bg-white text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>

            <section className={sectionClassName}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">주문자 정보</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    결제 승인과 주문 확인에 필요한 최소 정보만 입력해 주세요.
                  </p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {isLoggedIn ? "회원 자동 입력 지원" : "비회원 주문 가능"}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input
                  value={buyerName}
                  onChange={(event) => setBuyerName(event.target.value)}
                  placeholder="주문자명"
                  className={inputClassName}
                />
                <input
                  value={buyerPhone}
                  onChange={(event) => setBuyerPhone(event.target.value)}
                  placeholder="연락처"
                  className={inputClassName}
                />
                <input
                  value={buyerEmail}
                  onChange={(event) => setBuyerEmail(event.target.value)}
                  placeholder="이메일"
                  className={`md:col-span-2 ${inputClassName}`}
                />
                <input
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="회사명(선택)"
                  className={`md:col-span-2 ${inputClassName}`}
                />
              </div>
            </section>

            <section className={sectionClassName}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">사업자 주문 / 세금계산서</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    사업자회원, 현장 납품, 법인 구매는 필요한 경우에만 추가 정보를 남기면
                    됩니다.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <label className={checkboxCardClassName}>
                  <input
                    type="checkbox"
                    checked={isBusinessOrder}
                    onChange={(event) => setIsBusinessOrder(event.target.checked)}
                  />
                  사업자 주문입니다
                </label>
                <label className={checkboxCardClassName}>
                  <input
                    type="checkbox"
                    checked={taxInvoiceRequested}
                    onChange={(event) => setTaxInvoiceRequested(event.target.checked)}
                  />
                  세금계산서 발행 요청
                </label>
              </div>

              {isBusinessOrder || taxInvoiceRequested ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <input
                    value={businessNumber}
                    onChange={(event) => setBusinessNumber(event.target.value)}
                    placeholder="사업자등록번호"
                    className={inputClassName}
                  />
                  <input
                    value={ceoName}
                    onChange={(event) => setCeoName(event.target.value)}
                    placeholder="대표자명"
                    className={inputClassName}
                  />
                  <input
                    value={businessType}
                    onChange={(event) => setBusinessType(event.target.value)}
                    placeholder="업태"
                    className={inputClassName}
                  />
                  <input
                    value={businessItem}
                    onChange={(event) => setBusinessItem(event.target.value)}
                    placeholder="업종"
                    className={inputClassName}
                  />
                  <input
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="현장명 / 프로젝트명"
                    className={inputClassName}
                  />
                  <input
                    value={purchaseOrderNumber}
                    onChange={(event) => setPurchaseOrderNumber(event.target.value)}
                    placeholder="발주번호(선택)"
                    className={inputClassName}
                  />
                  {taxInvoiceRequested ? (
                    <input
                      value={taxInvoiceEmail}
                      onChange={(event) => setTaxInvoiceEmail(event.target.value)}
                      placeholder="세금계산서 수신 이메일"
                      className={`md:col-span-2 ${inputClassName}`}
                    />
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className={sectionClassName}>
              <h2 className="text-xl font-bold text-slate-900">배송 정보</h2>

              {addresses.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 text-sm font-semibold text-slate-700">저장 배송지 불러오기</div>
                  <select
                    value={selectedSavedAddressId}
                    onChange={(event) => handleSavedAddressChange(event.target.value)}
                    className={inputClassName}
                  >
                    {addresses.map((addressItem) => (
                      <option key={addressItem.id} value={addressItem.id}>
                        {addressItem.label}
                        {addressItem.isDefault ? " (기본)" : ""} / {addressItem.address}
                      </option>
                    ))}
                  </select>
                  {selectedSavedAddress ? (
                    <p className="mt-3 text-xs leading-6 text-slate-500">
                      {selectedSavedAddress.siteName
                        ? `현장명 ${selectedSavedAddress.siteName} 기준 배송지입니다.`
                        : "저장해둔 배송지를 그대로 불러옵니다."}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input
                  value={receiverName}
                  onChange={(event) => setReceiverName(event.target.value)}
                  placeholder="수령인"
                  className={inputClassName}
                />
                <input
                  value={receiverPhone}
                  onChange={(event) => setReceiverPhone(event.target.value)}
                  placeholder="연락처"
                  className={inputClassName}
                />
                <input
                  value={zipCode}
                  onChange={(event) => setZipCode(event.target.value)}
                  placeholder="우편번호"
                  className={inputClassName}
                />
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="주소"
                  className={inputClassName}
                />
                <input
                  value={detailAddress}
                  onChange={(event) => setDetailAddress(event.target.value)}
                  placeholder="상세주소"
                  className={`md:col-span-2 ${inputClassName}`}
                />
                <textarea
                  value={deliveryMemo}
                  onChange={(event) => setDeliveryMemo(event.target.value)}
                  placeholder="배송메모(선택)"
                  rows={3}
                  className={`md:col-span-2 ${inputClassName}`}
                />
              </div>
            </section>

            <section className={sectionClassName}>
              <h2 className="text-xl font-bold text-slate-900">결제 수단</h2>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-sm font-bold text-slate-900">토스페이먼츠 카드 결제</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  현재는 결제창으로 바로 넘어가며, 결제 승인 후 주문 저장과 재고 반영이 함께
                  처리됩니다. 사업자 반복 주문은 회원 정보와 저장 배송지 기준으로 더 빠르게
                  진행할 수 있습니다.
                </p>
              </div>
            </section>

            <LegalNoticePanel
              title="주문 전 꼭 확인해 주세요"
              description="건축자재 주문은 일반 소비재보다 운임, 현장 조건, 회수 조건의 영향이 커서 아래 사항을 함께 확인하시는 것이 좋습니다."
              items={orderLegalNoticeItems}
              links={[
                { href: "/refund-policy", label: "교환/반품/환불 정책" },
                { href: "/shipping-policy", label: "배송정책" },
                { href: "/disclaimer", label: "상품 유의사항" },
              ]}
            />
          </div>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-slate-900">최종 결제 요약</h2>

            <div className="mt-5 space-y-3">
              {checkoutItems.slice(0, 3).map((item) => (
                <div
                  key={`${item.product.id}-${item.quantity}-summary`}
                  className="rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {item.product.name}
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span>{item.quantity}개</span>
                    <span className="font-semibold text-slate-900">
                      {formatPrice((item.product.price ?? 0) * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {checkoutItems.length > 3 ? (
              <div className="mt-3 text-xs font-semibold text-slate-500">
                외 {checkoutItems.length - 3}개 상품 포함
              </div>
            ) : null}

            <div className="my-6 border-t border-slate-200" />

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>총 수량</span>
                <span className="font-semibold text-slate-900">
                  {totalQuantity.toLocaleString()}개
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>배송 방식</span>
                <span className="font-semibold text-slate-900">상품별 상이</span>
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-600">총 결제금액</div>
                <div className="mt-1 text-xs text-slate-500">부가 조건은 주문 후 확인 가능합니다.</div>
              </div>
              <div className="text-3xl font-black text-slate-900">{formatPrice(totalAmount)}</div>
            </div>

            <div className="mt-6">
              <ConsentChecklist
                title="결제 전 확인 및 동의"
                description="주문 내용 확인과 정책 동의가 완료되어야 결제를 진행할 수 있습니다."
                items={[...orderConsentItems]}
                values={orderConsentValues}
                allChecked={allOrderConsentsChecked}
                onToggle={handleOrderConsentToggle}
                onToggleAll={handleOrderConsentToggleAll}
              />
            </div>

            <button
              type="button"
              onClick={handlePayment}
              disabled={loading || !allOrderConsentsChecked}
              className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "결제창 준비 중..." : "토스페이먼츠로 바로 결제하기"}
            </button>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-500">
              주문 승인 후 주문 저장, 재고 차감, 관리자 확인까지 이어집니다. 화물배송,
              대량 발주, 현장 납품은 견적문의로 함께 접수하면 더 빠르게 안내됩니다.
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-6 text-slate-500">
              문의: {companyInfo.phone} · {companyInfo.email}
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50">
          <Header />
          <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              주문 페이지를 준비 중입니다...
            </div>
          </section>
          <Footer />
        </main>
      }
    >
      <OrderPageContent />
    </Suspense>
  );
}
