create extension if not exists pgcrypto;

do $$ begin
  create type public.incident_category as enum ('Accident','Fighting','Rioting','Fire','Robbery/Theft','Flooding','Medical Emergency','Other');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 80),
  created_at timestamptz not null default now()
);

create table if not exists public.incidents (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reporter_name text not null check (char_length(trim(reporter_name)) between 2 and 80),
  title text not null check (char_length(trim(title)) between 4 and 120),
  description text not null check (char_length(trim(description)) between 10 and 2000),
  category public.incident_category not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  address text check (address is null or char_length(address) <= 300),
  image_urls text[] not null default '{}' check (cardinality(image_urls) <= 4),
  created_at timestamptz not null default now()
);

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null unique,
  device_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_deliveries (
  incident_id uuid primary key references public.incidents(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.push_receipts (
  ticket_id text primary key,
  token_id uuid not null references public.push_tokens(id) on delete cascade,
  attempts smallint not null default 0,
  next_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists incidents_category_idx on public.incidents(category);
create index if not exists incidents_created_at_id_idx on public.incidents(created_at desc, id desc);
create index if not exists incidents_user_created_idx on public.incidents(user_id, created_at desc, id desc);
create index if not exists push_receipts_due_idx on public.push_receipts(next_attempt_at);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, full_name) values (new.id, coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'Citizen')) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
insert into public.profiles(id, full_name) select id, coalesce(nullif(trim(raw_user_meta_data->>'full_name'), ''), 'Citizen') from auth.users on conflict (id) do nothing;

create or replace function public.protect_incident_fields() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.user_id <> old.user_id then raise exception 'Incident ownership cannot change'; end if;
  select full_name into new.reporter_name from public.profiles where id = new.user_id;
  return new;
end $$;
drop trigger if exists protect_incident_fields_trigger on public.incidents;
create trigger protect_incident_fields_trigger before insert or update on public.incidents for each row execute function public.protect_incident_fields();

create or replace function public.register_push_token(p_token text, p_device_id text) returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  delete from public.push_tokens where device_id = p_device_id or token = p_token;
  insert into public.push_tokens(user_id, token, device_id) values (auth.uid(), p_token, p_device_id);
end $$;
create or replace function public.unregister_push_token(p_device_id text) returns void language sql security definer set search_path = '' as $$ delete from public.push_tokens where user_id = auth.uid() and device_id = p_device_id $$;
revoke all on function public.register_push_token(text,text) from public; grant execute on function public.register_push_token(text,text) to authenticated;
revoke all on function public.unregister_push_token(text) from public; grant execute on function public.unregister_push_token(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.incidents enable row level security;
alter table public.push_tokens enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.push_receipts enable row level security;

create policy "profiles select own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "incidents public read" on public.incidents for select to anon, authenticated using (true);
create policy "incidents owner insert" on public.incidents for insert to authenticated with check (user_id = auth.uid());
create policy "incidents owner update" on public.incidents for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "incidents owner delete" on public.incidents for delete to authenticated using (user_id = auth.uid());
create policy "tokens owner read" on public.push_tokens for select to authenticated using (user_id = auth.uid());

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types) values ('incident-images','incident-images',true,5242880,array['image/jpeg']) on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "incident images public read" on storage.objects for select to anon, authenticated using (bucket_id = 'incident-images');
create policy "incident images owner insert" on storage.objects for insert to authenticated with check (bucket_id = 'incident-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "incident images owner update" on storage.objects for update to authenticated using (bucket_id = 'incident-images' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'incident-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "incident images owner delete" on storage.objects for delete to authenticated using (bucket_id = 'incident-images' and (storage.foldername(name))[1] = auth.uid()::text);

do $$ begin alter publication supabase_realtime add table public.incidents; exception when duplicate_object then null; end $$;
