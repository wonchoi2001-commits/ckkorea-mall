create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text,
  name text not null,
  category text,
  category_main text,
  category_sub text,
  brand text,
  manufacturer text,
  origin text,
  spec text,
  unit text,
  price integer check (price is null or price >= 0),
  shipping text,
  stock integer check (stock is null or stock >= 0),
  description text,
  short_description text,
  image_url text,
  options_json jsonb,
  detail_json jsonb,
  featured boolean not null default false,
  quote_required boolean not null default false,
  bulky_item boolean not null default false,
  source_site text,
  source_url text,
  search_keywords text,
  sort_order integer,
  deleted_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
  add column if not exists slug text,
  add column if not exists category text,
  add column if not exists category_main text,
  add column if not exists category_sub text,
  add column if not exists brand text,
  add column if not exists manufacturer text,
  add column if not exists origin text,
  add column if not exists spec text,
  add column if not exists unit text,
  add column if not exists price integer,
  add column if not exists shipping text,
  add column if not exists stock integer,
  add column if not exists description text,
  add column if not exists short_description text,
  add column if not exists image_url text,
  add column if not exists options_json jsonb,
  add column if not exists detail_json jsonb,
  add column if not exists featured boolean not null default false,
  add column if not exists quote_required boolean not null default false,
  add column if not exists bulky_item boolean not null default false,
  add column if not exists source_site text,
  add column if not exists source_url text,
  add column if not exists search_keywords text,
  add column if not exists sort_order integer,
  add column if not exists deleted_at timestamptz,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists products_slug_unique_idx
  on public.products ((lower(slug)))
  where slug is not null;

create index if not exists products_active_idx on public.products (is_active);
create index if not exists products_featured_idx on public.products (featured);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_category_main_idx on public.products (category_main);
create index if not exists products_sort_order_idx on public.products (sort_order);
create index if not exists products_quote_required_idx on public.products (quote_required);
create index if not exists products_deleted_at_idx on public.products (deleted_at);

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;

create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_products_updated_at();
