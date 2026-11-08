-- HRR product catalogue.
-- Run this once in Supabase -> SQL Editor. It is safe to run again.
--
-- Every field in products.json maps to a column here:
--   id, slug, name, brand, collection, gender, category, price, mrp,
--   description, featured, imageFit -> image_fit
--   colors[] -> product_colors (name, hex, images, sizes, amazonUrl -> amazon_url)

create extension if not exists pgcrypto;

create table if not exists public.products (
  id           text primary key,
  slug         text unique not null,
  name         text not null,
  brand        text,
  collection   text,
  gender       text,
  category     text,
  price        int,
  mrp          int,
  description  text,
  featured     boolean default false,
  image_fit    text,
  is_active    boolean default true,
  sort_order   int default 0,
  created_at   timestamptz default now()
);

create table if not exists public.product_colors (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null references public.products(id) on delete cascade,
  name        text not null,
  hex         text,
  images      text[] not null default '{}',
  sizes       text[] not null default '{}',
  amazon_url  text default '',
  sort_order  int default 0,
  unique (product_id, name)
);

create index if not exists product_colors_product_id_idx on public.product_colors (product_id);

-- Row Level Security: the public (anon) key can only read active products and their colours.
-- There are no insert/update/delete policies, so only the secret key (which bypasses RLS)
-- or the Supabase dashboard can change data.
alter table public.products enable row level security;
alter table public.product_colors enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public can read colours of active products" on public.product_colors;
create policy "Public can read colours of active products"
  on public.product_colors for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_colors.product_id and p.is_active = true
    )
  );
