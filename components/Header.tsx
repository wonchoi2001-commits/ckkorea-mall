"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useShopper } from "@/components/ShopperProvider";
import { companyInfo } from "@/lib/data";

const primaryLinks = [
  { href: "/", label: "홈" },
  { href: "/products", label: "상품" },
  { href: "/quote", label: "견적문의" },
  { href: "/shipping", label: "배송안내" },
  { href: "/about", label: "회사소개" },
  { href: "/business-benefits", label: "사업자회원 혜택" },
];

export default function Header() {
  const router = useRouter();
  const { totalCount } = useCart();
  const { isLoggedIn, isBusinessMember, businessApproved, loading, profile, signOut } =
    useShopper();

  const roleLabel = isBusinessMember
    ? businessApproved
      ? "사업자 승인회원"
      : "사업자 승인대기"
    : "개인회원";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/92 backdrop-blur-xl">
      <div className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-[11px] font-medium sm:px-6">
          <div className="flex min-w-0 items-center gap-3 overflow-hidden text-slate-300">
            <span className="truncate">{companyInfo.hours}</span>
            <span className="hidden truncate sm:inline">{companyInfo.phone}</span>
            <span className="hidden truncate lg:inline">{companyInfo.email}</span>
          </div>
          <div className="hidden items-center gap-4 text-slate-300 lg:flex">
            <Link href="/quote" className="transition hover:text-white">
              현장 납품 / 대량 견적
            </Link>
            <Link href="/business-benefits" className="transition hover:text-white">
              사업자회원 혜택
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            title={companyInfo.companyName}
            className="min-w-0 flex-1 pr-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black tracking-[0.24em] text-white">
                CK
              </div>
              <div className="min-w-0">
                <div className="truncate text-xl font-black tracking-[0.08em] text-slate-950 sm:text-2xl">
                  CKKOREA
                </div>
                <div className="hidden truncate text-xs text-slate-500 md:block">
                  건축자재 · 철물 · 배관 · 공구 전문 자사몰
                </div>
              </div>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/cart"
              className="inline-flex h-10 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-50"
            >
              장바구니
              {totalCount > 0 ? (
                <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-slate-950 px-2 py-0.5 text-[11px] font-bold text-white">
                  {totalCount}
                </span>
              ) : null}
            </Link>

            {loading ? null : isLoggedIn ? (
              <>
                <Link
                  href="/mypage"
                  className="hidden h-10 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-50 md:inline-flex"
                >
                  내 계정
                </Link>
                <div className="hidden max-w-[180px] items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-white xl:flex">
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold tracking-wide text-slate-100">
                    {roleLabel}
                  </span>
                  <span className="truncate text-xs font-semibold text-slate-200">
                    {profile?.name || "회원"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    router.push("/");
                    router.refresh();
                  }}
                  className="inline-flex h-10 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-50"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-50"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-10 items-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex h-10 shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <Link
                href="/mypage#orders"
                className="inline-flex h-10 shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
              >
                주문내역
              </Link>
              <Link
                href="/mypage#favorites"
                className="inline-flex h-10 shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
              >
                관심상품
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
