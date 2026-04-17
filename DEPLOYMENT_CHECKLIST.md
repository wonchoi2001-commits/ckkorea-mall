# Deployment Checklist

## GitHub 업로드 전

- [ ] `.env.local`이 git에 포함되지 않는지 확인
- [ ] `.next`, `.next-dev`, `.vercel`, `.DS_Store`가 추적되지 않는지 확인
- [ ] `npm run lint`
- [ ] `npm run build`

## Supabase

- [ ] `supabase/products_schema.sql` 적용
- [ ] `supabase/orders_schema.sql` 적용
- [ ] `supabase/quote_requests_schema.sql` 적용
- [ ] `supabase/storage_setup.sql` 적용
- [ ] `supabase/member_schema.sql` 적용
- [ ] `product-images` 버킷 및 public 정책 확인

## Vercel

- [ ] `NEXT_PUBLIC_SITE_URL` 설정
- [ ] Supabase / Toss / 관리자 관련 환경변수 등록
- [ ] 프로덕션 빌드 성공 확인

## 운영 정보

- [ ] 통신판매업 신고번호 확보 후 placeholder 교체
- [ ] 최종 도메인 연결 후 canonical / sitemap / robots 재확인
- [ ] 실사업자 정보 최종 점검

## 배포 후

- [ ] 메인 / 상품목록 / 상품상세 확인
- [ ] 회원가입 / 로그인 / 마이페이지 확인
- [ ] 장바구니 / 주문 / 결제 테스트
- [ ] 견적문의 접수 테스트
- [ ] 관리자 로그인 / 상품 수정 테스트
