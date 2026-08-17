create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

insert into public.categories (name, slug)
values
  ('Thực phẩm & đồ uống', 'thuc-pham-do-uong'),
  ('Đồ gia dụng', 'do-gia-dung'),
  ('Chăm sóc cá nhân', 'cham-soc-ca-nhan'),
  ('Nhà thuốc', 'nha-thuoc')
on conflict (slug) do nothing;

alter table public.products add column if not exists category_id uuid references public.categories(id) on delete set null;
alter table public.products add column if not exists sale_price numeric(14,2) check (sale_price is null or sale_price >= 0);
alter table public.products add column if not exists is_hot boolean not null default false;
alter table public.products add column if not exists updated_at timestamptz not null default now();

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_is_hot_idx on public.products(is_hot);

alter table public.categories enable row level security;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select using (true);

drop policy if exists categories_auth_insert on public.categories;
create policy categories_auth_insert on public.categories for insert to authenticated with check (true);

drop policy if exists categories_auth_update on public.categories;
create policy categories_auth_update on public.categories for update to authenticated using (true) with check (true);

drop policy if exists categories_auth_delete on public.categories;
create policy categories_auth_delete on public.categories for delete to authenticated using (true);

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']::text[]
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif']::text[];

drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists product_images_auth_insert on storage.objects;
create policy product_images_auth_insert
on storage.objects for insert to authenticated
with check (bucket_id = 'product-images');

drop policy if exists product_images_auth_update on storage.objects;
create policy product_images_auth_update
on storage.objects for update to authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

drop policy if exists product_images_auth_delete on storage.objects;
create policy product_images_auth_delete
on storage.objects for delete to authenticated
using (bucket_id = 'product-images');
