"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ConsentChecklist from "@/components/legal/ConsentChecklist";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { normalizeBusinessNumber, normalizePhoneNumber } from "@/lib/utils";

type MemberType = "personal" | "business";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/mypage";
  const [memberType, setMemberType] = useState<MemberType>("personal");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [defaultAddress, setDefaultAddress] = useState("");
  const [defaultDetailAddress, setDefaultDetailAddress] = useState("");
  const [receiveMarketing, setReceiveMarketing] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [taxEmail, setTaxEmail] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessDetailAddress, setBusinessDetailAddress] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessItem, setBusinessItem] = useState("");
  const [bulkPurchaseEnabled, setBulkPurchaseEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const consentItems = [
    { id: "terms", label: "이용약관 동의", href: "/terms", required: true },
    { id: "privacy", label: "개인정보처리방침 동의", href: "/privacy", required: true },
    { id: "marketing", label: "마케팅 정보 수신 동의", href: "/marketing-consent" },
  ] as const;
  const consentValues = {
    terms: termsConsent,
    privacy: privacyConsent,
    marketing: receiveMarketing,
  };
  const allConsentsChecked = consentItems.every((item) => consentValues[item.id]);

  const handleConsentToggle = (id: string, checked: boolean) => {
    if (id === "terms") {
      setTermsConsent(checked);
      return;
    }

    if (id === "privacy") {
      setPrivacyConsent(checked);
      return;
    }

    if (id === "marketing") {
      setReceiveMarketing(checked);
    }
  };

  const handleConsentToggleAll = (checked: boolean) => {
    setTermsConsent(checked);
    setPrivacyConsent(checked);
    setReceiveMarketing(checked);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!name || !email || !password || !phone) {
      setMessage("이름, 이메일, 비밀번호, 휴대폰번호는 필수 입력입니다.");
      setLoading(false);
      return;
    }

    if (memberType === "business" && (!companyName || !businessNumber || !managerName)) {
      setMessage("사업자회원은 회사명, 사업자등록번호, 담당자명을 입력해주세요.");
      setLoading(false);
      return;
    }

    if (!termsConsent || !privacyConsent) {
      setMessage("회원가입을 위해 이용약관과 개인정보처리방침 동의가 필요합니다.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            name,
            phone: normalizePhoneNumber(phone),
            memberType,
            zipcode,
            defaultAddress,
            defaultDetailAddress,
            receiveMarketing,
            companyName,
            businessNumber: normalizeBusinessNumber(businessNumber),
            managerName,
            managerPhone: normalizePhoneNumber(managerPhone || phone),
            taxEmail,
            businessAddress,
            businessDetailAddress,
            businessType,
            businessItem,
            bulkPurchaseEnabled,
            consentTermsAgreed: termsConsent,
            consentPrivacyAgreed: privacyConsent,
            consentMarketingAgreed: receiveMarketing,
            consentedAt: new Date().toISOString(),
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.session) {
        router.push(redirectTo);
        router.refresh();
        return;
      }

      setMessage(
        memberType === "business"
          ? "회원가입이 완료되었습니다. 이메일 인증 후 로그인하면 사업자회원 승인 대기 상태로 등록됩니다."
          : "회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요."
      );
    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      setMessage("회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setMemberType("personal")}
          className={`rounded-3xl border px-5 py-5 text-left transition ${
            memberType === "personal"
              ? "border-slate-950 bg-slate-950 text-white"
              : "border-slate-300 bg-white text-slate-900"
          }`}
        >
          <div className="text-lg font-black">개인회원</div>
          <p className="mt-2 text-sm leading-6 opacity-90">
            일반 가격 확인, 배송지 저장, 관심상품/최근 본 상품, 재구매 동선을 사용할 수 있습니다.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setMemberType("business")}
          className={`rounded-3xl border px-5 py-5 text-left transition ${
            memberType === "business"
              ? "border-blue-900 bg-blue-950 text-white"
              : "border-slate-300 bg-white text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="text-lg font-black">사업자회원</div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              B2B
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 opacity-90">
            대량구매 상담, 세금계산서 대응, 재주문, 현장 납품 문의 흐름을 더 빠르게 이용할 수 있습니다.
          </p>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">이름</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">이메일</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">비밀번호</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">휴대폰번호</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">우편번호</label>
          <input value={zipcode} onChange={(e) => setZipcode(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">기본 배송지</label>
          <input value={defaultAddress} onChange={(e) => setDefaultAddress(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">상세주소</label>
          <input value={defaultDetailAddress} onChange={(e) => setDefaultDetailAddress(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" />
        </div>
      </div>

      {memberType === "business" ? (
        <div className="rounded-[30px] border border-blue-200 bg-blue-50 p-5">
          <div className="text-lg font-black text-slate-900">사업자회원 추가 정보</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            사업자회원은 승인 상태, 세금계산서 이메일, 담당자 정보, 대량구매 성향을 함께 관리할 수 있습니다.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="회사명" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" />
            <input value={businessNumber} onChange={(e) => setBusinessNumber(e.target.value)} placeholder="사업자등록번호" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" />
            <input value={managerName} onChange={(e) => setManagerName(e.target.value)} placeholder="담당자명" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" />
            <input value={managerPhone} onChange={(e) => setManagerPhone(e.target.value)} placeholder="담당자 연락처" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" />
            <input value={taxEmail} onChange={(e) => setTaxEmail(e.target.value)} placeholder="세금계산서 이메일" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" />
            <input value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="회사 주소" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" />
            <input value={businessDetailAddress} onChange={(e) => setBusinessDetailAddress(e.target.value)} placeholder="회사 상세주소" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" />
            <input value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="업태" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" />
            <input value={businessItem} onChange={(e) => setBusinessItem(e.target.value)} placeholder="업종" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" />
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-2xl border border-blue-200 bg-white px-4 py-4 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={bulkPurchaseEnabled}
              onChange={(event) => setBulkPurchaseEnabled(event.target.checked)}
            />
            대량구매/반복발주 혜택 안내를 받고 싶습니다
          </label>
        </div>
      ) : null}

      <ConsentChecklist
        title="약관 및 수신 동의"
        description="회원가입을 진행하려면 필수 약관 동의가 필요합니다. 마케팅 정보 수신 동의는 선택사항이며, 동의하지 않아도 서비스 이용은 가능합니다."
        items={[...consentItems]}
        values={consentValues}
        allChecked={allConsentsChecked}
        onToggle={handleConsentToggle}
        onToggleAll={handleConsentToggleAll}
      />

      {/* TODO: 정책 버전별 동의 이력은 추후 profiles 또는 전용 consent history 테이블로 분리 저장 필요 */}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-base font-bold text-white disabled:opacity-60"
      >
        {loading ? "가입 처리 중..." : memberType === "business" ? "사업자회원 가입" : "회원가입"}
      </button>

      {message ? <p className="text-sm font-medium text-slate-700">{message}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <Link href="/login" className="font-semibold text-slate-700 hover:text-slate-950">
          이미 계정이 있나요? 로그인
        </Link>
        <Link
          href="/business-benefits"
          className="font-semibold text-slate-700 hover:text-slate-950"
        >
          사업자회원 혜택 보기
        </Link>
      </div>
    </form>
  );
}
