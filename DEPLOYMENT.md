# Deployment Guide

## 1. 배포 전 준비

### Supabase

다음 SQL 파일을 순서대로 적용합니다.

1. `supabase/products_schema.sql`
2. `supabase/orders_schema.sql`
3. `supabase/quote_requests_schema.sql`
4. `supabase/storage_setup.sql`
5. `supabase/member_schema.sql`

확인할 항목:

- `products`, `orders`, `order_items`, `quote_requests`, `profiles` 테이블 생성 여부
- `product-images` Storage 버킷 및 public URL 정책
- 관리자용 Auth 계정 생성 여부

### Toss Payments

- 테스트 키에서 라이브 키로 교체
- 성공/실패 리디렉션 URL 점검
- 실도메인 연결 후 PG 설정 재검토

### 실사업 정보

아직 없는 값은 placeholder 상태로 유지됩니다.

- 최종 도메인
- 통신판매업 신고번호

위 두 값은 확보 후 아래 위치를 함께 갱신해야 합니다.

- `.env.local` 또는 Vercel 환경변수의 `NEXT_PUBLIC_SITE_URL`
- `lib/data.ts`에서 표시되는 회사 정보 기반 UI

## 2. Vercel 배포

### Framework

- Framework Preset: `Next.js`
- Build Command: 기본값 사용 가능 (`next build`)
- Output Directory: 기본값 사용

### 필수 환경변수

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PRODUCT_IMAGE_BUCKET`
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`
- `TOSS_PAYMENTS_SECRET_KEY`
- `ADMIN_EMAILS`

선택 환경변수:

- `QUOTE_RECEIVER_EMAIL`
- `ADMIN_NOTIFICATION_EMAILS`
- `ORDER_RECEIVER_EMAILS`
- `QUOTE_RECEIVER_EMAILS`
- `NOTIFICATION_FROM_EMAIL`
- `RESEND_API_KEY`
- `ADMIN_NOTIFICATION_WEBHOOK_URL`

## 3. 배포 후 점검

- `/`
- `/products`
- `/products/[slug]`
- `/cart`
- `/order`
- `/quote`
- `/login`
- `/signup`
- `/mypage`
- `/admin/login`

추가 확인:

- `robots.txt`
- `sitemap.xml`
- 상품 이미지 노출
- 주문 생성 / 결제 성공 / 결제 실패
- 견적문의 접수
- 관리자 상품 수정 반영

## 4. GitHub 업로드 전

- `.env.local` 포함 여부 재확인
- `.next`, `.next-dev`, `.vercel`, `.DS_Store`가 git 추적 대상이 아닌지 확인
- `npm run lint`
- `npm run build`

## 5. 현재 배포상 막히는 부분

- 최종 실도메인이 없으므로 canonical, open graph, sitemap host는 임시 환경변수 기준으로 생성됩니다.
- 통신판매업 신고번호가 없으므로 푸터/회사정보/정책 페이지에는 placeholder만 유지됩니다.
