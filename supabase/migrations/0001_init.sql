-- nacp core schema: roles, catalog, chapters, per-user reading state, comments.
-- Every table has RLS on. Staff power comes only from profiles.role, which users can't edit themselves.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  role text not null default 'reader' check (role in ('reader', 'uploader', 'editor', 'admin')),
  premium_until timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.role_rank(r text) returns int
language sql immutable set search_path = '' as $$
  select case r when 'admin' then 3 when 'editor' then 2 when 'uploader' then 1 else 0 end
$$;

-- security definer so policies can read the caller's role without recursing into profiles RLS
create or replace function public.has_role(min_role text) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select public.role_rank(p.role) >= public.role_rank(min_role) from public.profiles p where p.id = auth.uid()), false)
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name) values (new.id, split_part(new.email, '@', 1));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
create policy "read own profile or staff reads all" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.has_role('editor'));
create policy "update own profile" on public.profiles for update to authenticated
  using (id = (select auth.uid()));
-- users may only change their display name; role/premium change via set_role() or the payment webhook
revoke update on public.profiles from authenticated, anon;
grant update (display_name) on public.profiles to authenticated;

-- second lock, independent of grants: API roles can never change role/premium directly.
-- set_role() (security definer, runs as owner) and the service-role webhook pass.
create or replace function public.protect_profile() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user in ('authenticated', 'anon')
     and (new.role is distinct from old.role or new.premium_until is distinct from old.premium_until) then
    raise exception 'role and premium are not user-editable';
  end if;
  return new;
end $$;
create trigger protect_profile before update on public.profiles
  for each row execute function public.protect_profile();

create or replace function public.set_role(target uuid, new_role text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.has_role('admin') then raise exception 'forbidden'; end if;
  if target = auth.uid() and new_role <> 'admin' then raise exception 'cannot demote yourself'; end if;
  update public.profiles set role = new_role where id = target;
end $$;
revoke execute on function public.set_role(uuid, text) from public, anon;
grant execute on function public.set_role(uuid, text) to authenticated;

create table public.comics (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  title text not null,
  type text not null check (type in ('Manga', 'Manhwa', 'Manhua', 'Lokal')),
  genre text not null,
  genres text[] not null default '{}',
  status text not null default 'Berjalan' check (status in ('Berjalan', 'Tamat')),
  author text,
  partner text,
  synopsis_id text,
  synopsis_en text,
  cover_url text,
  hue int not null default 250,
  rating numeric(2,1) not null default 0,
  views bigint not null default 0,
  published boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.comics enable row level security;
create policy "public reads published comics" on public.comics for select to anon, authenticated
  using (published or public.has_role('uploader'));
create policy "editors write comics" on public.comics for all to authenticated
  using (public.has_role('editor')) with check (public.has_role('editor'));

create table public.chapters (
  id bigint generated always as identity primary key,
  comic_id text not null references public.comics on delete cascade,
  number numeric(7,1) not null,
  title text,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  publish_at timestamptz,
  early_access_until timestamptz,
  pages text[] not null default '{}', -- storage object paths, in reading order
  created_by uuid references auth.users on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (comic_id, number)
);
create index chapters_comic_idx on public.chapters (comic_id, number desc);

alter table public.chapters enable row level security;
create policy "public reads released chapters" on public.chapters for select to anon, authenticated
  using ((status in ('published', 'scheduled') and publish_at <= now()) or public.has_role('uploader'));
create policy "uploaders add chapters" on public.chapters for insert to authenticated
  with check (public.has_role('uploader'));
create policy "uploaders edit own drafts, editors edit all" on public.chapters for update to authenticated
  using (public.has_role('editor') or (public.has_role('uploader') and created_by = (select auth.uid()) and status <> 'published'));
create policy "editors delete chapters" on public.chapters for delete to authenticated
  using (public.has_role('editor'));

create table public.bookmarks (
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  comic_id text not null references public.comics on delete cascade,
  notify boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (user_id, comic_id)
);
alter table public.bookmarks enable row level security;
create policy "own bookmarks" on public.bookmarks for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create table public.reading_progress (
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  comic_id text not null references public.comics on delete cascade,
  chapter numeric(7,1) not null,
  page int not null default 1,
  updated_at timestamptz not null default now(),
  primary key (user_id, comic_id)
);
alter table public.reading_progress enable row level security;
create policy "own progress" on public.reading_progress for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create table public.comments (
  id bigint generated always as identity primary key,
  chapter_id bigint not null references public.chapters on delete cascade,
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  body text not null check (char_length(body) between 1 and 2000),
  hidden boolean not null default false,
  flags int not null default 0,
  created_at timestamptz not null default now()
);
create index comments_chapter_idx on public.comments (chapter_id, created_at desc);
alter table public.comments enable row level security;
create policy "read visible comments" on public.comments for select to anon, authenticated
  using (not hidden or public.has_role('editor'));
create policy "write own comments" on public.comments for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "delete own or moderate" on public.comments for delete to authenticated
  using (user_id = (select auth.uid()) or public.has_role('editor'));
create policy "moderate comments" on public.comments for update to authenticated
  using (public.has_role('editor'));
