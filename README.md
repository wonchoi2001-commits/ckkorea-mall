# CKKOREA Mall

CKKOREA 건축자재/철물/공구 자사몰 프로젝트입니다.  
Next.js App Router, TypeScript, Tailwind CSS, Supabase, Toss Payments 기반으로 구성되어 있습니다.

## 현재 범위

- 상품 목록 / 상세 / 장바구니 / 주문 / 견적문의
- 회원가입 / 로그인 / 마이페이지
- 개인회원 / 사업자회원 분리 구조
- 관리자 상품 / 주문 / 견적 관리
- Supabase 상품 / 주문 / 회원 / 견적 데이터 구조
- Toss Payments 테스트 결제 흐름
- SEO 기본 구조, robots, sitemap, 정책 페이지

## 빠른 시작

1. Node.js 20 이상 설치
2. 의존성 설치

```bash
npm install
```

3. 환경변수 파일 생성

```bash
cp .env.local.example .env.local
```

4. Supabase SQL 적용

- `supabase/products_schema.sql`
- `supabase/orders_schema.sql`
- `supabase/quote_requests_schema.sql`
- `supabase/storage_setup.sql`
- `supabase/member_schema.sql`

5. 개발 서버 실행

```bash
npm run dev
```

기본 개발 주소는 `http://127.0.0.1:3001` 입니다.

## 주요 스크립트

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run type-check
```

상품 대량 동기화:

```bash
npm run collect:products
npm run normalize:products
npm run import:products
npm run sync:products
```

stage4 대량 상품 seed/import:

```bash
npm run seed:products:stage4
npm run import:products:stage4
npm run refresh:featured
npm run sync:products:stage4
```

## 필수 환경변수

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

## 배포 전 반드시 확인할 것

- 실도메인이 아직 없으면 `NEXT_PUBLIC_SITE_URL`은 임시값 대신 실제 연결 시점에 갱신해야 합니다.
- 통신판매업 신고번호가 아직 없으면 현재 placeholder를 유지하고, 발급 후 정책/푸터/회사정보에 반영해야 합니다.
- Toss Payments는 테스트 키에서 라이브 키로 교체해야 합니다.
- Supabase Storage `product-images` 버킷 공개 정책을 확인해야 합니다.

## 문서

- 현재 상태 정리: `PROJECT_STATUS.md`
- 배포 가이드: `DEPLOYMENT.md`
- 짧은 배포 체크리스트: `DEPLOYMENT_CHECKLIST.md`
- 상품 콘텐츠 요약: `docs/product-content-summary.md`
- stage4 상품 요약: `docs/product-stage4-summary.md`

## 운영 메모

- 비회원 주문은 유지됩니다.
- 회원 주문은 저장 배송지, 관심상품, 최근 본 상품, 재주문 흐름을 지원합니다.
- 사업자회원은 사업자 정보 저장, 세금계산서 대응, 반복 구매 흐름을 위한 구조가 준비되어 있습니다.
