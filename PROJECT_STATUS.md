# Project Status

## 구현 완료

- Supabase 기반 상품 단일 소스 적용
- 공개 참고 seed 기반 상품 수집/정제/import 자동화 추가
- 카테고리 6개 기준 49개 상품 콘텐츠 생성 및 DB 반영 완료
- 홈, 상품목록, 상품상세, 주문, 견적문의가 동일한 상품 데이터 구조 사용
- 관리자 상품관리: 등록, 수정, 삭제, 추천 설정, 활성/비활성, 재고 관리
- 관리자 상품관리: 전용 등록 페이지(`/admin/products/new`) / 수정 페이지(`/admin/products/[id]/edit`) 추가
- 관리자 주문관리: 주문 조회, 배송 상태 저장, 환불 처리
- 관리자 주문관리: 부분 환불, 전체 환불, 환불 이력 조회, 배송 상태 저장
- 관리자 주문관리: 주문 상세 페이지(`/admin/orders/[id]`) 추가
- 관리자 견적문의 관리: 목록 조회, 상태 변경, 관리자 메모 저장
- 관리자 견적문의 관리: 상세 페이지(`/admin/quotes/[id]`) 추가
- 관리자 상품 이미지 업로드: Supabase Storage 업로드 API(`/api/upload/product-image`) 추가
- Toss Payments 결제 승인 후 주문 저장 및 재고 차감
- 재고 부족 시 자동 결제 취소 및 주문 취소 처리
- 장바구니 기반 주문/결제 흐름 추가
- 주문 접수 / 견적문의 접수 알림 구조 추가
- 사업자 주문, 세금계산서 요청, 발행 상태 관리 구조 추가
- 정책 페이지, Footer 링크, robots, sitemap, manifest, 기본 metadata 정리

## 수동 작업 필요

1. Supabase SQL Editor에서 아래 파일을 순서대로 실행
   - `supabase/products_schema.sql`
   - `supabase/orders_schema.sql`
   - `supabase/quote_requests_schema.sql`
   - `supabase/storage_setup.sql`
2. Supabase Storage 버킷 이미지 URL이 공개 접근 가능한지 확인
3. 관리자 계정에 `ADMIN_EMAILS` 또는 `app_metadata.role=admin` 적용
4. 테스트 결제와 테스트 견적문의로 관리자 화면 반영 여부 확인
5. 통신판매업 신고번호, 실제 교환/반품 주소, 실제 환불 연락처 문구 최종 반영
6. 이메일 알림 사용 시 `.env.local` 또는 배포 환경변수에 `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`, 수신 이메일 목록 또는 웹훅 URL 등록
7. 도메인 준비 전에는 이메일 대신 `ADMIN_NOTIFICATION_WEBHOOK_URL`만 먼저 써도 운영 가능
8. `products` 테이블에 확장 컬럼을 쓰려면 `supabase/products_schema.sql` 을 다시 실행
9. 실판매 전 `scripts/output/normalized_products.json` 기준으로 실제 상품 이미지와 실운임/실판매가를 한 번 더 검수

## Production 전환 전 확인

- `NEXT_PUBLIC_SITE_URL`을 실제 도메인으로 설정
- Toss Payments live key 전환
- Supabase production project와 service role key 교체
- 도메인 연결 후 `robots.txt`, `sitemap.xml` 정상 노출 확인
- 개인정보처리방침 / 이용약관 / 환불안내 문구 최종 검수
- 실제 배송비 정책과 무료배송 기준 검수
- 주문/견적 알림 메일 또는 웹훅 수신 확인
- 세금계산서 요청 주문의 관리자 발행 상태 저장 확인

## 비고

- 부분 환불은 관리자 주문 화면에서 상품 수량 기준으로 처리 가능
- 세금계산서 실발행 ERP/회계 연동, 사업자 전용 단가 정책은 후속 확장 포인트
