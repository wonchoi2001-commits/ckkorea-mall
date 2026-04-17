create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'personal' check (role in ('personal', 'business', 'admin')),
  name text,
  email text,
  phone text,
  default_address text,
  default_detail_address text,
  zipcode text,
  receive_marketing boolean not null default false,
  is_active boolean not null default true,
  company_name text,
  business_number text,
  business_status text not null default 'pending' check (
    business_status in ('pending', 'approved', 'rejected')
  ),
  tax_email text,
  business_address text,
  business_detail_address text,
  manager_name text,
  manager_phone text,
  business_type text,
  business_item text,
  bulk_purchase_enabled boolean not null default false,
  business_discount_rate numeric(5,2) not null default 0,
  memo text,
  preferred_payment_method text,
  saved_delivery_requests text[] not null default '{}'::text[],
  order_count integer not null default 0,
  total_purchase_amount bigint not null default 0,
  favorite_categories text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default '기본 배송지',
  recipient_name text,
  phone text,
  zipcode text,
  address text,
  detail_address text,
  delivery_memo text,
  site_name text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorite_products (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.recently_viewed_products (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  last_viewed_at timestamptz not null default now(),
  view_count integer not null default 1,
  primary key (user_id, product_id)
);

alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.quote_requests
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_business_status_idx on public.profiles (business_status);
create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists saved_addresses_user_id_idx on public.saved_addresses (user_id);
create index if not exists favorite_products_user_id_idx on public.favorite_products (user_id);
create index if not exists recently_viewed_products_user_id_idx on public.recently_viewed_products (user_id);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists quote_requests_user_id_idx on public.quote_requests (user_id);

create or replace function public.set_member_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_member_updated_at();

drop trigger if exists set_saved_addresses_updated_at on public.saved_addresses;
create trigger set_saved_addresses_updated_at
before update on public.saved_addresses
for each row execute function public.set_member_updated_at();

create or replace function public.ensure_single_default_address()
returns trigger
language plpgsql
as $$
begin
  if new.is_default then
    update public.saved_addresses
    set is_default = false
    where user_id = new.user_id
      and id <> new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists ensure_single_default_address on public.saved_addresses;
create trigger ensure_single_default_address
before insert or update on public.saved_addresses
for each row execute function public.ensure_single_default_address();

create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text;
  business_state text;
begin
  user_role :=
    case
      when coalesce(new.raw_app_meta_data ->> 'role', '') = 'admin' then 'admin'
      when coalesce(new.raw_user_meta_data ->> 'memberType', '') = 'business' then 'business'
      else 'personal'
    end;

  business_state :=
    case
      when user_role = 'business' then 'pending'
      else 'approved'
    end;

  insert into public.profiles (
    id,
    role,
    name,
    email,
    phone,
    company_name,
    business_number,
    business_status,
    tax_email,
    business_address,
    business_detail_address,
    manager_name,
    manager_phone,
    business_type,
    business_item,
    bulk_purchase_enabled,
    receive_marketing
  )
  values (
    new.id,
    user_role,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'companyName', ''),
    nullif(new.raw_user_meta_data ->> 'businessNumber', ''),
    business_state,
    nullif(new.raw_user_meta_data ->> 'taxEmail', ''),
    nullif(new.raw_user_meta_data ->> 'businessAddress', ''),
    nullif(new.raw_user_meta_data ->> 'businessDetailAddress', ''),
    nullif(new.raw_user_meta_data ->> 'managerName', ''),
    nullif(new.raw_user_meta_data ->> 'managerPhone', ''),
    nullif(new.raw_user_meta_data ->> 'businessType', ''),
    nullif(new.raw_user_meta_data ->> 'businessItem', ''),
    coalesce((new.raw_user_meta_data ->> 'bulkPurchaseEnabled')::boolean, false),
    coalesce((new.raw_user_meta_data ->> 'receiveMarketing')::boolean, false)
  )
  on conflict (id) do update
  set
    role = excluded.role,
    name = coalesce(nullif(excluded.name, ''), public.profiles.name),
    email = coalesce(excluded.email, public.profiles.email),
    phone = coalesce(nullif(excluded.phone, ''), public.profiles.phone),
    company_name = coalesce(excluded.company_name, public.profiles.company_name),
    business_number = coalesce(excluded.business_number, public.profiles.business_number),
    tax_email = coalesce(excluded.tax_email, public.profiles.tax_email),
    manager_name = coalesce(excluded.manager_name, public.profiles.manager_name),
    manager_phone = coalesce(excluded.manager_phone, public.profiles.manager_phone),
    business_type = coalesce(excluded.business_type, public.profiles.business_type),
    business_item = coalesce(excluded.business_item, public.profiles.business_item),
    bulk_purchase_enabled = excluded.bulk_purchase_enabled,
    receive_marketing = excluded.receive_marketing,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_profile();

insert into public.profiles (
  id,
  role,
  name,
  email,
  phone,
  company_name,
  business_number,
  business_status,
  tax_email,
  manager_name,
  manager_phone,
  business_type,
  business_item,
  bulk_purchase_enabled
)
select
  users.id,
  case
    when coalesce(users.raw_app_meta_data ->> 'role', '') = 'admin' then 'admin'
    when coalesce(users.raw_user_meta_data ->> 'memberType', '') = 'business' then 'business'
    else 'personal'
  end as role,
  coalesce(users.raw_user_meta_data ->> 'name', ''),
  users.email,
  coalesce(users.raw_user_meta_data ->> 'phone', ''),
  nullif(users.raw_user_meta_data ->> 'companyName', ''),
  nullif(users.raw_user_meta_data ->> 'businessNumber', ''),
  case
    when coalesce(users.raw_user_meta_data ->> 'memberType', '') = 'business' then 'pending'
    else 'approved'
  end as business_status,
  nullif(users.raw_user_meta_data ->> 'taxEmail', ''),
  nullif(users.raw_user_meta_data ->> 'managerName', ''),
  nullif(users.raw_user_meta_data ->> 'managerPhone', ''),
  nullif(users.raw_user_meta_data ->> 'businessType', ''),
  nullif(users.raw_user_meta_data ->> 'businessItem', ''),
  coalesce((users.raw_user_meta_data ->> 'bulkPurchaseEnabled')::boolean, false)
from auth.users as users
on conflict (id) do nothing;
