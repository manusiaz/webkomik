-- Advisor fixes. has_role() stays executable (RLS policies call it; it only reveals the caller's own role)
-- and set_role() stays executable (it checks admin itself).
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop policy "editors write comics" on public.comics;
create policy "editors insert comics" on public.comics for insert to authenticated with check (public.has_role('editor'));
create policy "editors update comics" on public.comics for update to authenticated using (public.has_role('editor'));
create policy "editors delete comics" on public.comics for delete to authenticated using (public.has_role('editor'));

create index bookmarks_comic_idx on public.bookmarks (comic_id);
create index reading_progress_comic_idx on public.reading_progress (comic_id);
create index comments_user_idx on public.comments (user_id);
create index chapters_created_by_idx on public.chapters (created_by);
