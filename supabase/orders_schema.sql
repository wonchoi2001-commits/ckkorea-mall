create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  customer_name text,
  customer_phone text,
  customer_email text,
  receiver_name text,
  receiver_phone text,
  zip_code text,
  address text,
  detail_address text,
  delivery_memo text,
  total_amount integer,
  order_name text not null,
  amount integer not null check (amount >= 0),
  currency text not null default 'KRW',
  status text not null default 'READY' check (status in ('READY', 'DONE', 'FAILED', 'CANCELED')),
  fulfillment_status text not null default 'PENDING_PAYMENT' check (
    fulfillment_status in (
      'PENDING_PAYMENT',
      'PREPARING',
      'READY_TO_SHIP',
      'SHIPPED',
      'DELIVERED',
      'PAYMENT_FAILED',
      'CANCELED'
    )
  ),
  customer jsonb not null,
  shipping jsonb not null,
  items jsonb not null,
  payment_key text,
  payment_method text,
  approved_at timestamptz,
  canceled_at timestamptz,
  cancel_reason text,
  refunded_amount integer not null default 0,
  failure_code text,
  failure_message text,
  business jsonb,
  tax_invoice_status text not null default 'NOT_REQUESTED' check (
    tax_invoice_status in ('NOT_REQUESTED', 'REQUESTED', 'ISSUED')
  ),
  tax_invoice_note text,
  shipping_carrier text,
  tracking_number text,
  admin_memo text,
  stock_deducted boolean not null default false,
  refund_history jsonb not null default '[]'::jsonb,
  toss_payment_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete restrict,
  product_name text not null,
  price integer not null default 0,
  quantity integer not null default 1 check (quantity > 0),
  spec text,
  shipping text,
  unit text,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.products
  add column if not exists stock integer;

alter table public.orders
  add column if not exists order_id text,
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists customer_email text,
  add column if not exists receiver_name text,
  add column if not exists receiver_phone text,
  add column if not exists zip_code text,
  add column if not exists address text,
  add column if not exists detail_address text,
  add column if not exists delivery_memo text,
  add column if not exists total_amount integer,
  add column if not exists order_name text,
  add column if not exists amount integer,
  add column if not exists currency text default 'KRW',
  add column if not exists status text default 'READY',
  add column if not exists fulfillment_status text not null default 'PENDING_PAYMENT',
  add column if not exists customer jsonb,
  add column if not exists shipping jsonb,
  add column if not exists items jsonb,
  add column if not exists payment_key text,
  add column if not exists payment_method text,
  add column if not exists approved_at timestamptz,
  add column if not exists canceled_at timestamptz,
  add column if not exists cancel_reason text,
  add column if not exists refunded_amount integer not null default 0,
  add column if not exists failure_code text,
  add column if not exists failure_message text,
  add column if not exists business jsonb,
  add column if not exists tax_invoice_status text not null default 'NOT_REQUESTED',
  add column if not exists tax_invoice_note text,
  add column if not exists shipping_carrier text,
  add column if not exists tracking_number text,
  add column if not exists admin_memo text,
  add column if not exists stock_deducted boolean not null default false,
  add column if not exists refund_history jsonb not null default '[]'::jsonb,
  add column if not exists toss_payment_data jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.orders
set
  currency = coalesce(currency, 'KRW'),
  status = coalesce(status, 'READY'),
  fulfillment_status = coalesce(
    fulfillment_status,
    case
      when status = 'FAILED' then 'PAYMENT_FAILED'
      when status = 'CANCELED' then 'CANCELED'
      when approved_at is not null then 'PREPARING'
      else 'PENDING_PAYMENT'
    end
  ),
  refunded_amount = coalesce(refunded_amount, 0),
  tax_invoice_status = coalesce(
    tax_invoice_status,
    case
      when business is not null and coalesce((business ->> 'taxInvoiceRequested')::boolean, false)
        then 'REQUESTED'
      else 'NOT_REQUESTED'
    end
  ),
  stock_deducted = coalesce(stock_deducted, false),
  refund_history = coalesce(refund_history, '[]'::jsonb),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now())
where
  currency is null
  or status is null
  or fulfillment_status is null
  or refunded_amount is null
  or tax_invoice_status is null
  or stock_deducted is null
  or refund_history is null
  or created_at is null
  or updated_at is null;

alter table public.orders
  alter column currency set default 'KRW',
  alter column status set default 'READY',
  alter column fulfillment_status set default 'PENDING_PAYMENT',
  alter column refunded_amount set default 0,
  alter column tax_invoice_status set default 'NOT_REQUESTED',
  alter column stock_deducted set default false,
  alter column refund_history set default '[]'::jsonb,
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table public.orders
  alter column currency set not null,
  alter column status set not null,
  alter column fulfillment_status set not null,
  alter column refunded_amount set not null,
  alter column tax_invoice_status set not null,
  alter column stock_deducted set not null,
  alter column refund_history set not null,
  alter column created_at set not null,
  alter column updated_at set not null;

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check check (
    status in ('READY', 'DONE', 'FAILED', 'CANCELED')
  );

alter table public.orders
  drop constraint if exists orders_fulfillment_status_check;

alter table public.orders
  add constraint orders_fulfillment_status_check check (
    fulfillment_status in (
      'PENDING_PAYMENT',
      'PREPARING',
      'READY_TO_SHIP',
      'SHIPPED',
      'DELIVERED',
      'PAYMENT_FAILED',
      'CANCELED'
    )
  );

alter table public.orders
  drop constraint if exists orders_tax_invoice_status_check;

alter table public.orders
  add constraint orders_tax_invoice_status_check check (
    tax_invoice_status in ('NOT_REQUESTED', 'REQUESTED', 'ISSUED')
  );

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_order_id_idx on public.orders (order_id);
create index if not exists orders_fulfillment_status_idx on public.orders (fulfillment_status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_customer_email_idx on public.orders ((customer ->> 'email'));
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);
create index if not exists products_stock_idx on public.products (stock);

create or replace function public.set_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_orders_updated_at on public.orders;

create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_orders_updated_at();

create or replace function public.mark_order_paid(
  order_id_input text,
  amount_input integer,
  payment_key_input text,
  payment_method_input text,
  approved_at_input timestamptz,
  toss_payment_data_input jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.orders;
  updated_order public.orders;
  item jsonb;
  quantity_value integer;
  product_exists boolean;
begin
  select *
  into order_row
  from public.orders
  where order_id = order_id_input
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND:%', order_id_input;
  end if;

  if order_row.status = 'DONE' then
    return order_row;
  end if;

  if order_row.status = 'CANCELED' then
    raise exception 'ORDER_ALREADY_CANCELED:%', order_id_input;
  end if;

  if not coalesce(order_row.stock_deducted, false) then
    for item in select * from jsonb_array_elements(order_row.items)
    loop
      quantity_value := greatest(coalesce((item ->> 'quantity')::integer, 0), 0);

      if quantity_value = 0 then
        continue;
      end if;

      select exists(
        select 1
        from public.products
        where id::text = item ->> 'productId'
      )
      into product_exists;

      if not product_exists then
        raise exception 'PRODUCT_NOT_FOUND:%', item ->> 'productId';
      end if;

      if exists(
        select 1
        from public.products
        where id::text = item ->> 'productId'
          and stock is null
      ) then
        continue;
      end if;

      update public.products
      set stock = stock - quantity_value
      where id::text = item ->> 'productId'
        and stock >= quantity_value;

      if not found then
        raise exception 'INSUFFICIENT_STOCK:%', item ->> 'productId';
      end if;
    end loop;
  end if;

  update public.orders
  set
    status = 'DONE',
    fulfillment_status = 'PREPARING',
    amount = amount_input,
    payment_key = payment_key_input,
    payment_method = payment_method_input,
    approved_at = approved_at_input,
    canceled_at = null,
    cancel_reason = null,
    refunded_amount = 0,
    failure_code = null,
    failure_message = null,
    stock_deducted = true,
    toss_payment_data = toss_payment_data_input
  where order_id = order_id_input
  returning *
  into updated_order;

  return updated_order;
end;
$$;

create or replace function public.mark_order_canceled(
  order_id_input text,
  cancel_reason_input text,
  canceled_at_input timestamptz,
  refunded_amount_input integer,
  toss_payment_data_input jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.orders;
  updated_order public.orders;
  item jsonb;
  quantity_value integer;
begin
  select *
  into order_row
  from public.orders
  where order_id = order_id_input
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND:%', order_id_input;
  end if;

  if order_row.status = 'CANCELED' then
    return order_row;
  end if;

  if coalesce(order_row.stock_deducted, false) then
    for item in select * from jsonb_array_elements(order_row.items)
    loop
      quantity_value := greatest(coalesce((item ->> 'quantity')::integer, 0), 0);

      if quantity_value = 0 then
        continue;
      end if;

      update public.products
      set stock = stock + quantity_value
      where id::text = item ->> 'productId'
        and stock is not null;
    end loop;
  end if;

  update public.orders
  set
    status = 'CANCELED',
    fulfillment_status = 'CANCELED',
    canceled_at = canceled_at_input,
    cancel_reason = cancel_reason_input,
    refunded_amount = greatest(coalesce(refunded_amount_input, amount), 0),
    stock_deducted = false,
    failure_code = null,
    failure_message = null,
    toss_payment_data = toss_payment_data_input
  where order_id = order_id_input
  returning *
  into updated_order;

  return updated_order;
end;
$$;

create or replace function public.record_order_refund(
  order_id_input text,
  cancel_reason_input text,
  canceled_at_input timestamptz,
  refunded_amount_input integer,
  toss_payment_data_input jsonb,
  refund_history_entry_input jsonb default null,
  restock_items_input jsonb default '[]'::jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.orders;
  updated_order public.orders;
  restock_item jsonb;
  quantity_value integer;
  next_refunded_amount integer;
begin
  select *
  into order_row
  from public.orders
  where order_id = order_id_input
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND:%', order_id_input;
  end if;

  next_refunded_amount := least(
    order_row.amount,
    greatest(
      coalesce(order_row.refunded_amount, 0) + greatest(coalesce(refunded_amount_input, 0), 0),
      0
    )
  );

  for restock_item in select * from jsonb_array_elements(coalesce(restock_items_input, '[]'::jsonb))
  loop
    quantity_value := greatest(coalesce((restock_item ->> 'quantity')::integer, 0), 0);

    if quantity_value = 0 then
      continue;
    end if;

    update public.products
    set stock = stock + quantity_value
    where id::text = restock_item ->> 'productId'
      and stock is not null;
  end loop;

  update public.orders
  set
    status = case
      when next_refunded_amount >= order_row.amount then 'CANCELED'
      else status
    end,
    fulfillment_status = case
      when next_refunded_amount >= order_row.amount then 'CANCELED'
      else fulfillment_status
    end,
    canceled_at = case
      when next_refunded_amount >= order_row.amount then coalesce(canceled_at_input, now())
      else canceled_at
    end,
    cancel_reason = case
      when next_refunded_amount >= order_row.amount then cancel_reason_input
      else cancel_reason
    end,
    refunded_amount = next_refunded_amount,
    stock_deducted = case
      when next_refunded_amount >= order_row.amount then false
      else stock_deducted
    end,
    failure_code = null,
    failure_message = null,
    toss_payment_data = toss_payment_data_input,
    refund_history = case
      when refund_history_entry_input is null then coalesce(refund_history, '[]'::jsonb)
      else coalesce(refund_history, '[]'::jsonb) || jsonb_build_array(refund_history_entry_input)
    end
  where order_id = order_id_input
  returning *
  into updated_order;

  return updated_order;
end;
$$;

alter table public.orders enable row level security;
