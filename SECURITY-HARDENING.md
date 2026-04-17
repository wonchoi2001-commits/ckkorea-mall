# SECURITY HARDENING

이 문서는 CKKOREA 자사몰에 적용한 보안 하드닝과 남은 수동 작업을 정리한 운영 문서입니다.
본 문서는 법률 자문이나 침해 대응 전문 자문을 대체하지 않으며, 실제 운영 전 Vercel/Supabase 설정 확인이 필요합니다.

## 적용 완료

- 환경변수 접근을 `zod` 기반 helper로 정리하고, import 시점이 아닌 실제 사용 시점에만 명확한 오류를 발생시키도록 조정했습니다.
- 브라우저/서버 Supabase 클라이언트 분리를 유지하면서, 서버 전용 비밀키는 서버 코드에서만 사용하도록 유지했습니다.
- 관리자 API, 계정 API, 견적문의, 결제 생성/승인/실패, 업로드 엔드포인트에 서버측 same-origin 검사와 best-effort rate limit를 추가했습니다.
- 관리자 상품 생성 API에 서버측 관리자 권한 검사를 추가했습니다.
- 결제 승인/실패 API에 서명된 checkout 세션 쿠키 보호를 추가해 외부 요청이 임의 주문 상태를 변경하기 어렵게 했습니다.
- 업로드는 SVG를 차단하고, 이미지 MIME/type과 용량 제한을 유지하도록 조정했습니다.
- 민감한 페이지(`admin`, `mypage`, `login`, `signup`, `payments`)에 `no-store`, `X-Robots-Tag`가 적용되도록 미들웨어를 추가했습니다.
- 사이트 전반에 CSP, 클릭재킹 방지, HSTS, Referrer-Policy, Permissions-Policy 등 보안 헤더를 추가했습니다.
- 클라이언트 로그인/회원가입 리다이렉트는 내부 경로만 허용하도록 정리해 open redirect 위험을 줄였습니다.
- 공용/관리자/계정 API의 오류 응답에서 내부 에러 메시지 노출을 줄이고, 서버 로그는 구조화된 최소 정보만 남기도록 바꿨습니다.

## 남은 위험 / 제한사항

- 현재 rate limit는 Vercel 환경에서 메모리 기반 best-effort 방식입니다. 인스턴스 간 전역 보장은 되지 않습니다.
- 결제 세션 보호는 `APP_SIGNING_SECRET` 미설정 시 `SUPABASE_SERVICE_ROLE_KEY`를 fallback으로 사용합니다.
  운영에서는 반드시 별도 `APP_SIGNING_SECRET`을 설정하는 것을 권장합니다.
- Row Level Security는 코드만으로 완결되지 않으므로, 실제 Supabase 정책 적용이 반드시 필요합니다.
- 관리자 권한은 현재 `app_metadata.role=admin` 또는 `ADMIN_EMAILS` 기반입니다. 운영에서는 메타데이터 역할 관리와 allowlist를 함께 검토하세요.

## 수동 체크리스트

### Vercel

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_SIGNING_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`
- `TOSS_PAYMENTS_SECRET_KEY`
- `ADMIN_EMAILS`

운영에서는 `APP_SIGNING_SECRET`을 새로 생성한 긴 랜덤 문자열로 설정하세요.

### Supabase

- `products`, `orders`, `order_items`, `profiles`, `saved_addresses`, `favorite_products`, `recently_viewed_products`, `quote_requests` 테이블의 RLS 활성화
- 공개 읽기/본인 소유 데이터 접근/관리자 전용 작업 정책 분리
- Storage `product-images` 버킷 public 정책 최소화 및 업로드 정책 재확인
- Auth 이메일 템플릿/redirect URL/allowed origins 확인

## 사고 대응 기본 원칙

- 비정상 주문 상태 변경, 관리자 접근 이상, 대량 실패 요청, 업로드 악용 정황이 보이면 우선 관련 env와 세션을 회전하고 주문/관리자 로그를 확인합니다.
- `SUPABASE_SERVICE_ROLE_KEY`, `APP_SIGNING_SECRET`, Toss secret key는 노출 의심 시 즉시 재발급합니다.
- 관리자 계정은 최소 권한으로 유지하고, 퇴사/권한 변경 시 즉시 `ADMIN_EMAILS` 또는 `app_metadata.role`를 정리합니다.

## REVIEW NEEDED

- 결제/주문/환불 정책과 운영자 대응 절차는 실제 CS 운영 프로세스와 맞는지 확인이 필요합니다.
- 법적 고지 문구와 개인정보 처리방침, 보관기간, 위탁업체 목록은 실제 운영 정보 기준으로 재검토가 필요합니다.
