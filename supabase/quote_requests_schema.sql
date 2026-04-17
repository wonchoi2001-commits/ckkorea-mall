create extension if not exists pgcrypto;

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text not null,
  is_business_order boolean not null default false,
  company_name text,
  business_number text,
  project_name text,
  tax_invoice_needed boolean not null default false,
  tax_invoice_email text,
  product_name text,
  product_slug text,
  quantity text,
  spec text,
  delivery_type text,
  delivery_area text,
  request_date date,
  request_type text,
  attachment_url text,
  message text not null,
  status text not null default 'NEW' check (status in ('NEW', 'IN_PROGRESS', 'COMPLETED')),
  admin_memo text,
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quote_requests
  add column if not exists is_business_order boolean not null default false,
  add column if not exists company_name text,
  add column if not exists business_number text,
  add column if not exists project_name text,
  add column if not exists tax_invoice_needed boolean not null default false,
  add column if not exists tax_invoice_email text,
  add column if not exists product_name text,
  add column if not exists product_slug text,
  add column if not exists quantity text,
  add column if not exists spec text,
  add column if not exists delivery_type text,
  add column if not exists delivery_area text,
  add column if not exists request_date date,
  add column if not exists request_type text,
  add column if not exists attachment_url text,
  add column if not exists admin_memo text,
  add column if not exists admin_reply text,
  add column if not exists replied_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.quote_requests
  drop constraint if exists quote_requests_status_check;

alter table public.quote_requests
  add constraint quote_requests_status_check check (
    status in ('NEW', 'IN_PROGRESS', 'COMPLETED')
  );

create index if not exists quote_requests_status_idx on public.quote_requests (status);
create index if not exists quote_requests_created_at_idx on public.quote_requests (created_at desc);
create index if not exists quote_requests_email_idx on public.quote_requests (email);

create or replace function public.set_quote_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_quote_requests_updated_at on public.quote_requests;

create trigger set_quote_requests_updated_at
before update on public.quote_requests
for each row
execute function public.set_quote_requests_updated_at();
