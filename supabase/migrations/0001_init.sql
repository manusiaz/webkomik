-- nacp schema. Shares a Supabase project with CBN, so every object is prefixed nacp_
-- and nothing hooks into auth.users: CBN signups never touch nacp.
-- Staff power comes only from nacp_profiles.role, which users can't edit themselves.

create table public.nacp_profiles (
  id uuid primary key references auth.users on delete cascade default auth.uid(),
  display_name text,
  role text not null default 'reader' check (role in ('reader', 'uploader', 'editor', 'admin')),
  premium_until timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.nacp_role_rank(r text) returns int
language sql immutable set search_path = '' as $$
  select case r when 'admin' then 3 when 'editor' then 2 when 'uploader' then 1 else 0 end
$$;

-- security definer so policies can read the caller's role without recursing into RLS.
-- Executable by API roles on purpose: policies call it, and it only reveals the caller's own role.
create or replace function public.nacp_has_role(min_role text) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select public.nacp_role_rank(p.role) >= public.nacp_role_rank(min_role) from public.nacp_profiles p where p.id = auth.uid()), false)
$$;

alter table public.nacp_profiles enable row level security;
create policy "nacp: read own profile or staff reads all" on public.nacp_profiles for select to authenticated
  using (id = (select auth.uid()) or public.nacp_has_role('editor'));
-- profile is created on first nacp sign-in (lazy), not by a trigger on the shared auth.users
create policy "nacp: create own profile" on public.nacp_profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy "nacp: update own profile" on public.nacp_profiles for update to authenticated
  using (id = (select auth.uid()));
revoke insert, update on public.nacp_profiles from authenticated, anon;
grant insert (id, display_name), update (display_name) on public.nacp_profiles to authenticated;

-- second lock, independent of grants: API roles can never set role/premium.
-- nacp_set_role() (security definer, runs as owner) and the service-role payment webhook pass.
create or replace function public.nacp_protect_profile() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user in ('authenticated', 'anon') and (
    (tg_op = 'INSERT' and (new.role <> 'reader' or new.premium_until is not null)) or
    (tg_op = 'UPDATE' and (new.role is distinct from old.role or new.premium_until is distinct from old.premium_until))
  ) then
    raise exception 'role and premium are not user-editable';
  end if;
  return new;
end $$;
create trigger nacp_protect_profile before insert or update on public.nacp_profiles
  for each row execute function public.nacp_protect_profile();

create or replace function public.nacp_set_role(target uuid, new_role text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.nacp_has_role('admin') then raise exception 'forbidden'; end if;
  if target = auth.uid() and new_role <> 'admin' then raise exception 'cannot demote yourself'; end if;
  update public.nacp_profiles set role = new_role where id = target;
end $$;
revoke execute on function public.nacp_set_role(uuid, text) from public, anon;
grant execute on function public.nacp_set_role(uuid, text) to authenticated;

create table public.nacp_comics (
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
alter table public.nacp_comics enable row level security;
create policy "nacp: public reads published comics" on public.nacp_comics for select to anon, authenticated
  using (published or public.nacp_has_role('uploader'));
create policy "nacp: editors insert comics" on public.nacp_comics for insert to authenticated with check (public.nacp_has_role('editor'));
create policy "nacp: editors update comics" on public.nacp_comics for update to authenticated using (public.nacp_has_role('editor'));
create policy "nacp: editors delete comics" on public.nacp_comics for delete to authenticated using (public.nacp_has_role('editor'));

create table public.nacp_chapters (
  id bigint generated always as identity primary key,
  comic_id text not null references public.nacp_comics on delete cascade,
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
create index nacp_chapters_comic_idx on public.nacp_chapters (comic_id, number desc);
create index nacp_chapters_created_by_idx on public.nacp_chapters (created_by);
alter table public.nacp_chapters enable row level security;
create policy "nacp: public reads released chapters" on public.nacp_chapters for select to anon, authenticated
  using ((status in ('published', 'scheduled') and publish_at <= now()) or public.nacp_has_role('uploader'));
create policy "nacp: uploaders add chapters" on public.nacp_chapters for insert to authenticated
  with check (public.nacp_has_role('uploader'));
create policy "nacp: uploaders edit own drafts, editors edit all" on public.nacp_chapters for update to authenticated
  using (public.nacp_has_role('editor') or (public.nacp_has_role('uploader') and created_by = (select auth.uid()) and status <> 'published'));
create policy "nacp: editors delete chapters" on public.nacp_chapters for delete to authenticated
  using (public.nacp_has_role('editor'));

create table public.nacp_bookmarks (
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  comic_id text not null references public.nacp_comics on delete cascade,
  notify boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (user_id, comic_id)
);
create index nacp_bookmarks_comic_idx on public.nacp_bookmarks (comic_id);
alter table public.nacp_bookmarks enable row level security;
create policy "nacp: own bookmarks" on public.nacp_bookmarks for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create table public.nacp_reading_progress (
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  comic_id text not null references public.nacp_comics on delete cascade,
  chapter numeric(7,1) not null,
  page int not null default 1,
  updated_at timestamptz not null default now(),
  primary key (user_id, comic_id)
);
create index nacp_reading_progress_comic_idx on public.nacp_reading_progress (comic_id);
alter table public.nacp_reading_progress enable row level security;
create policy "nacp: own progress" on public.nacp_reading_progress for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create table public.nacp_comments (
  id bigint generated always as identity primary key,
  chapter_id bigint not null references public.nacp_chapters on delete cascade,
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  body text not null check (char_length(body) between 1 and 2000),
  hidden boolean not null default false,
  flags int not null default 0,
  created_at timestamptz not null default now()
);
create index nacp_comments_chapter_idx on public.nacp_comments (chapter_id, created_at desc);
create index nacp_comments_user_idx on public.nacp_comments (user_id);
alter table public.nacp_comments enable row level security;
create policy "nacp: read visible comments" on public.nacp_comments for select to anon, authenticated
  using (not hidden or public.nacp_has_role('editor'));
create policy "nacp: write own comments" on public.nacp_comments for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "nacp: delete own or moderate" on public.nacp_comments for delete to authenticated
  using (user_id = (select auth.uid()) or public.nacp_has_role('editor'));
create policy "nacp: moderate comments" on public.nacp_comments for update to authenticated
  using (public.nacp_has_role('editor'));
