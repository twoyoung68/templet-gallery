-- EPC Design Gallery — PostgreSQL + Storage RLS
-- 1) Storage → New bucket → 이름: gallery-designs → Public bucket 으로 생성
-- 2) 아래 SQL 전체를 SQL Editor 에서 실행

create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  yaml text not null,
  thumbnail_data_url text,
  pdf_path text not null,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists designs_created_at_idx on public.designs (created_at desc);

alter table public.designs enable row level security;

drop policy if exists "designs_select_public" on public.designs;
drop policy if exists "designs_insert_public" on public.designs;
drop policy if exists "designs_update_public" on public.designs;
drop policy if exists "designs_delete_public" on public.designs;

create policy "designs_select_public" on public.designs for select using (true);
create policy "designs_insert_public" on public.designs for insert with check (true);
create policy "designs_update_public" on public.designs for update using (true);
create policy "designs_delete_public" on public.designs for delete using (true);

-- Storage.objects (버킷 gallery-designs 가 이미 있어야 함)

drop policy if exists "storage_gallery_read" on storage.objects;
drop policy if exists "storage_gallery_insert" on storage.objects;
drop policy if exists "storage_gallery_update" on storage.objects;
drop policy if exists "storage_gallery_delete" on storage.objects;

create policy "storage_gallery_read" on storage.objects for select using (bucket_id = 'gallery-designs');
create policy "storage_gallery_insert" on storage.objects for insert with check (bucket_id = 'gallery-designs');
create policy "storage_gallery_update" on storage.objects for update using (bucket_id = 'gallery-designs');
create policy "storage_gallery_delete" on storage.objects for delete using (bucket_id = 'gallery-designs');
