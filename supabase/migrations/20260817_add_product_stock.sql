-- Product inventory / stock quantity
alter table public.products
  add column if not exists stock integer not null default 0 check (stock >= 0);

create index if not exists products_stock_idx on public.products(stock);
