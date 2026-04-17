# SUPABASE RLS POLICIES

이 문서는 CKKOREA 자사몰 운영을 위한 제안용 RLS 정책 초안입니다.  
실제 적용 전 스키마명, 컬럼명, 운영 권한 구조를 반드시 다시 검토하세요.

## 기본 원칙

- 모든 테이블에 `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
- 공개 읽기가 필요한 데이터만 별도 `SELECT` 정책 허용
- 회원 소유 데이터는 `auth.uid() = user_id` 기반으로 제한
- 관리자 작업은 일반 정책으로 우회하지 말고, 서버에서 `service_role` 클라이언트로만 처리

## 1. products

공개 상품 목록은 활성 상품만 읽기 허용:

```sql
alter table public.products enable row level security;

create policy "public can read active products"
on public.products
for select
to anon, authenticated
using (
  is_active = true
  and coalesce((options_json->>'deletedAt')::text, '') = ''
);
```

주의:
- 관리자 생성/수정/삭제는 service role 서버 코드로만 수행
- authenticated 일반 유저에게 insert/update/delete 정책은 만들지 않는 것을 권장

## 2. orders

본인 주문만 읽기 허용:

```sql
alter table public.orders enable row level security;

create policy "users can read own orders"
on public.orders
for select
to authenticated
using (user_id = auth.uid());
```

주의:
- 주문 생성/결제 승인/환불/상태 변경은 service role 전용 권장
- anon 주문을 허용하는 현재 구조에서는 일반 insert 정책을 열지 말고 서버 API에서만 insert 처리

## 3. order_items

상위 주문 소유자만 읽기:

```sql
alter table public.order_items enable row level security;

create policy "users can read own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);
```

## 4. profiles

본인 프로필만 조회/수정:

```sql
alter table public.profiles enable row level security;

create policy "users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());
```

주의:
- 관리자 역할 변경, 사업자 승인 상태 변경은 service role 전용 권장

## 5. saved_addresses

```sql
alter table public.saved_addresses enable row level security;

create policy "users can manage own addresses"
on public.saved_addresses
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

## 6. favorite_products

```sql
alter table public.favorite_products enable row level security;

create policy "users can manage own favorites"
on public.favorite_products
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

## 7. recently_viewed_products

```sql
alter table public.recently_viewed_products enable row level security;

create policy "users can manage own recently viewed"
on public.recently_viewed_products
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

## 8. quote_requests

회원이 로그인 상태로 접수한 경우에만 본인 요청 조회 허용:

```sql
alter table public.quote_requests enable row level security;

create policy "users can read own quotes"
on public.quote_requests
for select
to authenticated
using (user_id = auth.uid());
```

주의:
- 견적 등록/관리자 메모/상태 변경은 service role 서버 코드로만 처리하는 것을 권장

## 9. Storage: product-images

권장 방향:
- `product-images`는 public read만 허용
- upload/update/delete는 browser 정책으로 열지 말고 서버 service role 업로드만 사용

예시:

```sql
-- public read only
create policy "public can read product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');
```

주의:
- insert/update/delete 정책은 브라우저 업로드가 필요하지 않다면 만들지 않는 것이 더 안전합니다.
- 현재 프로젝트는 관리자 업로드 API가 service role로 처리하므로 public write 정책이 없어도 됩니다.

## 10. 운영 체크포인트

- Auth 설정에서 Site URL과 Redirect URL을 실제 운영 도메인 기준으로 정리
- `service_role` 키는 Vercel 서버 env에만 두고 브라우저에 노출하지 않기
- 정책 적용 후:
  - 상품 공개 읽기
  - 내 주문 조회
  - 내 배송지 저장
  - 내 관심상품 저장
  - 관리자 상품 수정
  - 견적 등록
  를 순서대로 재테스트

## REVIEW NEEDED

- anon 주문 허용 여부에 따라 orders/order_items 정책 방향이 달라질 수 있습니다.
- 사업자회원 전용 가격/주문 정책이 추가되면 profiles/business_status 연계 정책도 다시 설계가 필요합니다.
