-- RoomieFinder database
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- It is safe to run again; it only creates what's missing.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Members: one row per signed-in person (created automatically on sign-up)
-- ---------------------------------------------------------------------------
create table if not exists public.members (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text not null default '' check (char_length(full_name) <= 80),
  avatar_url   text,
  age          smallint check (age between 16 and 99),
  gender       text check (gender in ('woman', 'man', 'nonbinary')),
  pref_gender  text not null default 'any' check (pref_gender in ('any', 'women', 'men')),
  occupation   text not null default '' check (char_length(occupation) <= 80),
  bio          text not null default '' check (char_length(bio) <= 600),
  city         text not null default '' check (char_length(city) <= 60),
  area         text not null default '' check (char_length(area) <= 60),
  housing      text check (housing in ('has_room', 'need_room', 'team_up')),
  rent_min     integer check (rent_min between 0 and 500000),
  rent_max     integer check (rent_max between 0 and 500000),
  move_in      date,
  sleep        smallint not null default 3 check (sleep between 1 and 5),
  tidiness     smallint not null default 3 check (tidiness between 1 and 5),
  social       smallint not null default 3 check (social between 1 and 5),
  guests       smallint not null default 3 check (guests between 1 and 5),
  noise        smallint not null default 3 check (noise between 1 and 5),
  smoking      text check (smoking in ('never', 'outside', 'yes')),
  drinking     text check (drinking in ('never', 'socially', 'often')),
  pets         text check (pets in ('none', 'love', 'have', 'allergic')),
  diet         text check (diet in ('vegan', 'veg', 'egg', 'nonveg')),
  interests    text[] not null default '{}',
  languages    text[] not null default '{}',
  visible      boolean not null default true,
  show_online  boolean not null default true,
  onboarded    boolean not null default false,
  last_seen    timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint rent_order check (rent_min is null or rent_max is null or rent_min <= rent_max)
);

create index if not exists members_city_idx on public.members (lower(city));

-- ---------------------------------------------------------------------------
-- Connections: a request from one member to another. Declining deletes it.
-- ---------------------------------------------------------------------------
create table if not exists public.connections (
  id            uuid primary key default gen_random_uuid(),
  requester_id  uuid not null references public.members (id) on delete cascade,
  addressee_id  uuid not null references public.members (id) on delete cascade,
  status        text not null default 'pending' check (status in ('pending', 'accepted')),
  note          text not null default '' check (char_length(note) <= 300),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint not_self check (requester_id <> addressee_id)
);

create unique index if not exists connections_pair_idx
  on public.connections (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists connections_addressee_idx on public.connections (addressee_id);

-- ---------------------------------------------------------------------------
-- Saved members, chat messages, activity feed
-- ---------------------------------------------------------------------------
create table if not exists public.saved_members (
  user_id     uuid not null references public.members (id) on delete cascade,
  member_id   uuid not null references public.members (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, member_id)
);

create table if not exists public.chat_messages (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references public.members (id) on delete cascade,
  recipient_id  uuid not null references public.members (id) on delete cascade,
  body          text not null check (char_length(btrim(body)) between 1 and 2000),
  kind          text not null default 'text' check (kind in ('text', 'prefs')),
  payload       jsonb check (payload is null or pg_column_size(payload) <= 4096),
  created_at    timestamptz not null default now(),
  read_at       timestamptz
);

-- For databases created before preference cards existed.
alter table public.chat_messages
  add column if not exists kind text not null default 'text' check (kind in ('text', 'prefs'));
alter table public.chat_messages
  add column if not exists payload jsonb check (payload is null or pg_column_size(payload) <= 4096);

create index if not exists chat_messages_recipient_idx on public.chat_messages (recipient_id, created_at desc);
create index if not exists chat_messages_sender_idx on public.chat_messages (sender_id, created_at desc);

create table if not exists public.activity (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.members (id) on delete cascade,
  actor_id    uuid references public.members (id) on delete cascade,
  kind        text not null check (kind in ('request', 'accepted', 'welcome')),
  created_at  timestamptz not null default now(),
  read_at     timestamptz
);

create index if not exists activity_user_idx on public.activity (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Helpers and triggers
-- ---------------------------------------------------------------------------
create or replace function public.rf_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists rf_members_touch on public.members;
create trigger rf_members_touch before update on public.members
  for each row execute function public.rf_touch_updated_at();

drop trigger if exists rf_connections_touch on public.connections;
create trigger rf_connections_touch before update on public.connections
  for each row execute function public.rf_touch_updated_at();

-- True when two members have an accepted connection.
create or replace function public.rf_are_connected(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.connections c
    where c.status = 'accepted'
      and ((c.requester_id = a and c.addressee_id = b) or (c.requester_id = b and c.addressee_id = a))
  );
$$;

-- True when two members have any connection, pending or accepted.
create or replace function public.rf_are_linked(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.connections c
    where (c.requester_id = a and c.addressee_id = b) or (c.requester_id = b and c.addressee_id = a)
  );
$$;

-- New auth user (Google or email) → member row, filled from their account.
create or replace function public.rf_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.members (id, full_name, avatar_url)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), ''), 80),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;

  insert into public.activity (user_id, kind) values (new.id, 'welcome');
  return new;
end;
$$;

-- Optional: the app also creates the member row itself on first sign-in,
-- so if this project doesn't allow triggers on auth.users, setup carries on.
do $do$
begin
  drop trigger if exists rf_on_auth_user_created on auth.users;
  create trigger rf_on_auth_user_created after insert on auth.users
    for each row execute function public.rf_handle_new_user();
exception when others then
  raise notice 'Skipped sign-up trigger: %', sqlerrm;
end;
$do$;

-- Activity entries for requests and acceptances.
create or replace function public.rf_connection_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity (user_id, actor_id, kind) values (new.addressee_id, new.requester_id, 'request');
  elsif tg_op = 'UPDATE' and new.status = 'accepted' and old.status <> 'accepted' then
    insert into public.activity (user_id, actor_id, kind) values (new.requester_id, new.addressee_id, 'accepted');
    -- The request has been answered; clear it from the addressee's feed.
    delete from public.activity
      where user_id = new.addressee_id and actor_id = new.requester_id and kind = 'request';
  end if;
  return new;
end;
$$;

drop trigger if exists rf_connection_activity on public.connections;
create trigger rf_connection_activity after insert or update on public.connections
  for each row execute function public.rf_connection_activity();

-- Lets a signed-in person delete their own account (and everything above, by cascade).
create or replace function public.rf_delete_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.rf_delete_account() from public, anon;
grant execute on function public.rf_delete_account() to authenticated;

-- Lets the sign-in page give specific messages ("no account with this email",
-- "incorrect password", "use Google"). Returns none | password | google | both.
create or replace function public.rf_email_status(p_email text)
returns text language sql stable security definer set search_path = public, auth as $$
  with u as (
    select id, coalesce(encrypted_password, '') <> '' as has_password
    from auth.users
    where lower(email) = lower(btrim(p_email))
    limit 1
  ),
  g as (
    select exists (
      select 1 from auth.identities i where i.user_id = (select id from u) and i.provider = 'google'
    ) as has_google
  )
  select case
    when not exists (select 1 from u) then 'none'
    when (select has_password from u) and (select has_google from g) then 'both'
    when (select has_password from u) then 'password'
    when (select has_google from g) then 'google'
    else 'password'
  end;
$$;

revoke all on function public.rf_email_status(text) from public;
grant execute on function public.rf_email_status(text) to anon, authenticated;

-- Members who signed up before this script ran (optional; the app also does this).
do $do$
begin
  insert into public.members (id, full_name, avatar_url)
  select
    u.id,
    left(coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1), ''), 80),
    coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
  from auth.users u
  on conflict (id) do nothing;
exception when others then
  raise notice 'Skipped copying existing accounts: %', sqlerrm;
end;
$do$;

-- Access for signed-in people (row level security below decides which rows).
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.members to authenticated;
grant select, insert, delete on public.connections to authenticated;
grant select, insert, delete on public.saved_members to authenticated;
grant select, insert on public.chat_messages to authenticated;
grant select on public.activity to authenticated;
grant execute on function public.rf_are_connected(uuid, uuid) to authenticated;
grant execute on function public.rf_are_linked(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.members       enable row level security;
alter table public.connections   enable row level security;
alter table public.saved_members enable row level security;
alter table public.chat_messages enable row level security;
alter table public.activity      enable row level security;

-- members: signed-in people see visible profiles, their own, and anyone they have a request with.
drop policy if exists "members read" on public.members;
create policy "members read" on public.members for select to authenticated
  using (visible or id = auth.uid() or public.rf_are_linked(id, auth.uid()));

drop policy if exists "members insert self" on public.members;
create policy "members insert self" on public.members for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "members update self" on public.members;
create policy "members update self" on public.members for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- connections: only the two people involved.
drop policy if exists "connections read" on public.connections;
create policy "connections read" on public.connections for select to authenticated
  using (auth.uid() in (requester_id, addressee_id));

drop policy if exists "connections request" on public.connections;
create policy "connections request" on public.connections for insert to authenticated
  with check (requester_id = auth.uid() and status = 'pending');

drop policy if exists "connections accept" on public.connections;
create policy "connections accept" on public.connections for update to authenticated
  using (addressee_id = auth.uid()) with check (addressee_id = auth.uid() and status = 'accepted');

drop policy if exists "connections remove" on public.connections;
create policy "connections remove" on public.connections for delete to authenticated
  using (auth.uid() in (requester_id, addressee_id));

-- Only the status can change on a connection, and only read_at on messages/activity.
revoke update on public.connections from anon, authenticated;
grant update (status) on public.connections to authenticated;

-- saved_members: your own list only.
drop policy if exists "saved own" on public.saved_members;
create policy "saved own" on public.saved_members for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- chat_messages: you see your conversations, and can only message connections.
drop policy if exists "messages read" on public.chat_messages;
create policy "messages read" on public.chat_messages for select to authenticated
  using (auth.uid() in (sender_id, recipient_id));

drop policy if exists "messages send" on public.chat_messages;
create policy "messages send" on public.chat_messages for insert to authenticated
  with check (sender_id = auth.uid() and public.rf_are_connected(sender_id, recipient_id));

drop policy if exists "messages mark read" on public.chat_messages;
create policy "messages mark read" on public.chat_messages for update to authenticated
  using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

revoke update on public.chat_messages from anon, authenticated;
grant update (read_at) on public.chat_messages to authenticated;

-- activity: your own feed; entries are written by the triggers above.
drop policy if exists "activity read" on public.activity;
create policy "activity read" on public.activity for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "activity mark read" on public.activity;
create policy "activity mark read" on public.activity for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke update on public.activity from anon, authenticated;
grant update (read_at) on public.activity to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: push new requests, messages and activity to open apps
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['members', 'connections', 'chat_messages', 'activity'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profile photos (Storage bucket "avatars", one folder per member)
-- ---------------------------------------------------------------------------
-- Wrapped so that, if this project doesn't allow it, the rest of the setup still works.
do $do$
begin
  insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

  drop policy if exists "rf avatars read" on storage.objects;
  create policy "rf avatars read" on storage.objects for select
    using (bucket_id = 'avatars');

  drop policy if exists "rf avatars upload" on storage.objects;
  create policy "rf avatars upload" on storage.objects for insert to authenticated
    with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

  drop policy if exists "rf avatars change" on storage.objects;
  create policy "rf avatars change" on storage.objects for update to authenticated
    using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

  drop policy if exists "rf avatars delete" on storage.objects;
  create policy "rf avatars delete" on storage.objects for delete to authenticated
    using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
exception when others then
  raise notice 'Skipped profile photo storage setup: %', sqlerrm;
end;
$do$;

-- Make the new tables visible to the app straight away.
notify pgrst, 'reload schema';
