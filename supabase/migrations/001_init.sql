-- Email Builder schema (Supabase)
-- Run this in Supabase SQL Editor.

-- Profiles table to map user id -> email (for sharing by email)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Allow signed-in users to read profiles (needed to resolve emails when sharing)
create policy "profiles_select_authenticated"
on public.profiles for select
to authenticated
using (true);

-- Only the user can update their own profile (not used much in MVP)
create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Trigger to auto-create profiles row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
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
after insert on auth.users
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

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_templates_updated_at on public.templates;
create trigger set_templates_updated_at
before update on public.templates
for each row execute procedure public.set_updated_at();

alter table public.templates enable row level security;

-- Version history
create table if not exists public.template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  version integer not null,
  saved_by uuid not null references auth.users(id) on delete set null,
  design_json jsonb,
  html text,
  created_at timestamptz not null default now(),
  unique(template_id, version)
);

alter table public.template_versions enable row level security;

-- Shares
create table if not exists public.template_shares (
  template_id uuid not null references public.templates(id) on delete cascade,
  shared_with uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('viewer','editor')),
  created_at timestamptz not null default now(),
  primary key (template_id, shared_with)
);

alter table public.template_shares enable row level security;


-- Helper views
create or replace view public.templates_shared_with_me as
select t.*
from public.templates t
join public.template_shares s on s.template_id = t.id
where s.shared_with = auth.uid();

create or replace view public.templates_accessible as
select distinct t.*
from public.templates t
left join public.template_shares s on s.template_id = t.id
where t.owner_id = auth.uid() or s.shared_with = auth.uid();


-- RLS policies
-- Templates: owner full access
create policy "templates_owner_select"
on public.templates for select
to authenticated
using (owner_id = auth.uid());

create policy "templates_owner_insert"
on public.templates for insert
to authenticated
with check (owner_id = auth.uid());

create policy "templates_owner_update"
on public.templates for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "templates_owner_delete"
on public.templates for delete
to authenticated
using (owner_id = auth.uid());

-- Templates: shared read access (viewer/editor)
create policy "templates_shared_select"
on public.templates for select
to authenticated
using (
  exists (
    select 1 from public.template_shares s
    where s.template_id = id
      and s.shared_with = auth.uid()
  )
);

-- Templates: shared update access (editor only)
create policy "templates_shared_update_editor"
on public.templates for update
to authenticated
using (
  exists (
    select 1 from public.template_shares s
    where s.template_id = id
      and s.shared_with = auth.uid()
      and s.role = 'editor'
  )
)
with check (
  exists (
    select 1 from public.template_shares s
    where s.template_id = id
      and s.shared_with = auth.uid()
      and s.role = 'editor'
  )
);

-- Template shares: only owner can manage
create policy "shares_owner_select"
on public.template_shares for select
to authenticated
using (
  exists (
    select 1 from public.templates t
    where t.id = template_id
      and t.owner_id = auth.uid()
  )
);

create policy "shares_owner_insert"
on public.template_shares for insert
to authenticated
with check (
  exists (
    select 1 from public.templates t
    where t.id = template_id
      and t.owner_id = auth.uid()
  )
);

create policy "shares_owner_update"
on public.template_shares for update
to authenticated
using (
  exists (
    select 1 from public.templates t
    where t.id = template_id
      and t.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.templates t
    where t.id = template_id
      and t.owner_id = auth.uid()
  )
);

create policy "shares_owner_delete"
on public.template_shares for delete
to authenticated
using (
  exists (
    select 1 from public.templates t
    where t.id = template_id
      and t.owner_id = auth.uid()
  )
);

-- Version history: allow read if template accessible
create policy "versions_select_accessible"
on public.template_versions for select
to authenticated
using (
  exists (
    select 1
    from public.templates t
    left join public.template_shares s on s.template_id = t.id
    where t.id = template_id
      and (t.owner_id = auth.uid() or s.shared_with = auth.uid())
  )
);

-- Version history: allow insert if owner OR editor
create policy "versions_insert_owner_or_editor"
on public.template_versions for insert
to authenticated
with check (
  saved_by = auth.uid()
  and exists (
    select 1
    from public.templates t
    left join public.template_shares s on s.template_id = t.id
    where t.id = template_id
      and (
        t.owner_id = auth.uid()
        or (s.shared_with = auth.uid() and s.role = 'editor')
      )
  )
);
