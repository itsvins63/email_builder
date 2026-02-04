-- Email Builder schema (Supabase)
-- Run this in Supabase SQL Editor.

-- Extensions
create extension if not exists "pgcrypto";

-- Profiles: public mirror of auth users for sharing-by-email
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email on auth.users
  for each row execute procedure public.handle_new_user();

-- Templates
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  current_design_json jsonb,
  current_html text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists templates_owner_id_idx on public.templates(owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists templates_set_updated_at on public.templates;
create trigger templates_set_updated_at
  before update on public.templates
  for each row execute procedure public.set_updated_at();

-- Sharing
create table if not exists public.template_shares (
  template_id uuid not null references public.templates(id) on delete cascade,
  shared_with uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('viewer','editor')),
  created_at timestamptz not null default now(),
  primary key (template_id, shared_with)
);

create index if not exists template_shares_shared_with_idx on public.template_shares(shared_with);

-- Versions
create table if not exists public.template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  version int not null,
  saved_by uuid references auth.users(id) on delete set null,
  design_json jsonb,
  html text,
  created_at timestamptz not null default now(),
  unique (template_id, version)
);

create index if not exists template_versions_template_id_idx on public.template_versions(template_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.templates enable row level security;
alter table public.template_shares enable row level security;
alter table public.template_versions enable row level security;

-- profiles: any authenticated user can read profiles for sharing-by-email
create policy "profiles_read" on public.profiles
  for select to authenticated
  using (true);

-- Helper to check sharing without triggering RLS recursion
create or replace function public.has_template_share(tid uuid, required_role text default null)
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists(
    select 1
    from public.template_shares s
    where s.template_id = tid
      and s.shared_with = auth.uid()
      and (required_role is null or s.role = required_role)
  );
$$;

-- templates: access = owner OR shared; edit = owner OR shared as editor
create policy "templates_select" on public.templates
  for select to authenticated
  using (owner_id = auth.uid() or public.has_template_share(id, null));

create policy "templates_insert" on public.templates
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy "templates_update" on public.templates
  for update to authenticated
  using (owner_id = auth.uid() or public.has_template_share(id, 'editor'))
  with check (true);

create policy "templates_delete" on public.templates
  for delete to authenticated
  using (owner_id = auth.uid());

-- Helper to avoid RLS recursion when policies reference each other
-- This function runs with table owner's privileges (bypasses RLS) and safely checks ownership.
create or replace function public.is_template_owner(tid uuid)
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists(
    select 1
    from public.templates t
    where t.id = tid
      and t.owner_id = auth.uid()
  );
$$;

-- template_shares: shared users can see rows about templates shared with them; only owner can manage
create policy "shares_select" on public.template_shares
  for select to authenticated
  using (
    shared_with = auth.uid() or public.is_template_owner(template_id)
  );

create policy "shares_insert_owner" on public.template_shares
  for insert to authenticated
  with check (public.is_template_owner(template_id));

create policy "shares_delete_owner" on public.template_shares
  for delete to authenticated
  using (public.is_template_owner(template_id));

-- versions: readable if template readable; insertable if editor/owner
create policy "versions_select" on public.template_versions
  for select to authenticated
  using (
    public.is_template_owner(template_id) or public.has_template_share(template_id, null)
  );

create policy "versions_insert" on public.template_versions
  for insert to authenticated
  with check (
    public.is_template_owner(template_id) or public.has_template_share(template_id, 'editor')
  );
