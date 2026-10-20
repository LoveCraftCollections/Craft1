create extension if not exists pgcrypto;

create table public.lovecraft_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_lovecraft_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.lovecraft_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_lovecraft_admin() from public;
grant execute on function public.is_lovecraft_admin() to anon, authenticated;

create type public.wedding_status as enum ('draft', 'published', 'disabled');

create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status public.wedding_status not null default 'draft',
  config jsonb not null check (jsonb_typeof(config) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index weddings_owner_id_idx on public.weddings (owner_id);
create index weddings_published_slug_idx on public.weddings (slug) where status = 'published';

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  submission_key uuid not null,
  guest_name text not null check (char_length(guest_name) between 1 and 100),
  attending boolean not null,
  guest_count smallint not null default 1 check (guest_count between 1 and 10),
  message text not null default '' check (char_length(message) <= 500),
  created_at timestamptz not null default now(),
  unique (wedding_id, submission_key)
);

create index rsvps_wedding_created_idx on public.rsvps (wedding_id, created_at desc);

alter table public.lovecraft_admins enable row level security;
alter table public.weddings enable row level security;
alter table public.rsvps enable row level security;

grant select on public.weddings to anon, authenticated;
grant insert, update, delete on public.weddings to authenticated;
grant insert on public.rsvps to anon, authenticated;
grant select, update, delete on public.rsvps to authenticated;

create policy "Published invitations and authorized owners can view weddings"
on public.weddings for select to anon, authenticated
using (
  status = 'published'
  or owner_id = (select auth.uid())
  or (select public.is_lovecraft_admin())
);

create policy "Wedding owners and LoveCraft administrators can manage weddings"
on public.weddings for all to authenticated
using (
  owner_id = (select auth.uid())
  or (select public.is_lovecraft_admin())
)
with check (
  owner_id = (select auth.uid())
  or (select public.is_lovecraft_admin())
);

create policy "Guests can RSVP to published invitations"
on public.rsvps for insert to anon, authenticated
with check (
  exists (
    select 1
    from public.weddings as wedding
    where wedding.id = wedding_id
      and wedding.status = 'published'
      and wedding.config #>> '{rsvp,enabled}' = 'true'
  )
);

create policy "Only wedding owners and LoveCraft administrators can view RSVPs"
on public.rsvps for select to authenticated
using (
  exists (
    select 1
    from public.weddings as wedding
    where wedding.id = wedding_id
      and (wedding.owner_id = (select auth.uid()) or (select public.is_lovecraft_admin()))
  )
);

create policy "Only wedding owners and LoveCraft administrators can manage RSVPs"
on public.rsvps for update to authenticated
using (
  exists (
    select 1
    from public.weddings as wedding
    where wedding.id = wedding_id
      and (wedding.owner_id = (select auth.uid()) or (select public.is_lovecraft_admin()))
  )
)
with check (
  exists (
    select 1
    from public.weddings as wedding
    where wedding.id = wedding_id
      and (wedding.owner_id = (select auth.uid()) or (select public.is_lovecraft_admin()))
  )
);

create policy "Only wedding owners and LoveCraft administrators can delete RSVPs"
on public.rsvps for delete to authenticated
using (
  exists (
    select 1
    from public.weddings as wedding
    where wedding.id = wedding_id
      and (wedding.owner_id = (select auth.uid()) or (select public.is_lovecraft_admin()))
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wedding-photos', 'wedding-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Published wedding photos are readable by invitees"
on storage.objects for select to anon, authenticated
using (
  bucket_id = 'wedding-photos'
  and exists (
    select 1
    from public.weddings as wedding
    where wedding.id::text = (storage.foldername(name))[1]
      and (
        wedding.status = 'published'
        or wedding.owner_id = (select auth.uid())
        or (select public.is_lovecraft_admin())
      )
  )
);

create policy "Wedding photo uploads belong to authorized hosts"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'wedding-photos'
  and exists (
    select 1
    from public.weddings as wedding
    where wedding.id::text = (storage.foldername(name))[1]
      and (wedding.owner_id = (select auth.uid()) or (select public.is_lovecraft_admin()))
  )
);

create policy "Wedding photo changes belong to authorized hosts"
on storage.objects for update to authenticated
using (
  bucket_id = 'wedding-photos'
  and exists (
    select 1
    from public.weddings as wedding
    where wedding.id::text = (storage.foldername(name))[1]
      and (wedding.owner_id = (select auth.uid()) or (select public.is_lovecraft_admin()))
  )
)
with check (
  bucket_id = 'wedding-photos'
  and exists (
    select 1
    from public.weddings as wedding
    where wedding.id::text = (storage.foldername(name))[1]
      and (wedding.owner_id = (select auth.uid()) or (select public.is_lovecraft_admin()))
  )
);

create policy "Wedding photo removal belongs to authorized hosts"
on storage.objects for delete to authenticated
using (
  bucket_id = 'wedding-photos'
  and exists (
    select 1
    from public.weddings as wedding
    where wedding.id::text = (storage.foldername(name))[1]
      and (wedding.owner_id = (select auth.uid()) or (select public.is_lovecraft_admin()))
  )
);

comment on table public.weddings is 'Tenant-scoped wedding configuration. Only published records are visible to anonymous visitors.';
comment on table public.rsvps is 'Private guest replies. Anonymous visitors can insert but cannot read; only the wedding owner or a LoveCraft administrator can view.';