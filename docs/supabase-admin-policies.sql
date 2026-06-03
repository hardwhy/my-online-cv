create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

drop policy if exists "Admins can read own allowlist row" on public.app_admins;
create policy "Admins can read own allowlist row"
on public.app_admins for select
using (auth.uid() = user_id);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_admins
    where user_id = auth.uid()
  );
$$;

drop policy if exists "Admins can read all profile rows" on public.site_profile;
create policy "Admins can read all profile rows" on public.site_profile for select using (public.is_admin());
drop policy if exists "Admins can insert profile rows" on public.site_profile;
create policy "Admins can insert profile rows" on public.site_profile for insert with check (public.is_admin());
drop policy if exists "Admins can update profile rows" on public.site_profile;
create policy "Admins can update profile rows" on public.site_profile for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete profile rows" on public.site_profile;
create policy "Admins can delete profile rows" on public.site_profile for delete using (public.is_admin());

drop policy if exists "Admins can read all skills" on public.skills;
create policy "Admins can read all skills" on public.skills for select using (public.is_admin());
drop policy if exists "Admins can insert skills" on public.skills;
create policy "Admins can insert skills" on public.skills for insert with check (public.is_admin());
drop policy if exists "Admins can update skills" on public.skills;
create policy "Admins can update skills" on public.skills for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete skills" on public.skills;
create policy "Admins can delete skills" on public.skills for delete using (public.is_admin());

drop policy if exists "Admins can read all experiences" on public.experiences;
create policy "Admins can read all experiences" on public.experiences for select using (public.is_admin());
drop policy if exists "Admins can insert experiences" on public.experiences;
create policy "Admins can insert experiences" on public.experiences for insert with check (public.is_admin());
drop policy if exists "Admins can update experiences" on public.experiences;
create policy "Admins can update experiences" on public.experiences for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete experiences" on public.experiences;
create policy "Admins can delete experiences" on public.experiences for delete using (public.is_admin());

drop policy if exists "Admins can read all projects" on public.projects;
create policy "Admins can read all projects" on public.projects for select using (public.is_admin());
drop policy if exists "Admins can insert projects" on public.projects;
create policy "Admins can insert projects" on public.projects for insert with check (public.is_admin());
drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects" on public.projects for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects" on public.projects for delete using (public.is_admin());

drop policy if exists "Admins can read all certifications" on public.certifications;
create policy "Admins can read all certifications" on public.certifications for select using (public.is_admin());
drop policy if exists "Admins can insert certifications" on public.certifications;
create policy "Admins can insert certifications" on public.certifications for insert with check (public.is_admin());
drop policy if exists "Admins can update certifications" on public.certifications;
create policy "Admins can update certifications" on public.certifications for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete certifications" on public.certifications;
create policy "Admins can delete certifications" on public.certifications for delete using (public.is_admin());

drop policy if exists "Admins can read all achievements" on public.achievements;
create policy "Admins can read all achievements" on public.achievements for select using (public.is_admin());
drop policy if exists "Admins can insert achievements" on public.achievements;
create policy "Admins can insert achievements" on public.achievements for insert with check (public.is_admin());
drop policy if exists "Admins can update achievements" on public.achievements;
create policy "Admins can update achievements" on public.achievements for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete achievements" on public.achievements;
create policy "Admins can delete achievements" on public.achievements for delete using (public.is_admin());

drop policy if exists "Admins can read all testimonials" on public.testimonials;
create policy "Admins can read all testimonials" on public.testimonials for select using (public.is_admin());
drop policy if exists "Admins can insert testimonials" on public.testimonials;
create policy "Admins can insert testimonials" on public.testimonials for insert with check (public.is_admin());
drop policy if exists "Admins can update testimonials" on public.testimonials;
create policy "Admins can update testimonials" on public.testimonials for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete testimonials" on public.testimonials;
create policy "Admins can delete testimonials" on public.testimonials for delete using (public.is_admin());

drop policy if exists "Admins can read all blog posts" on public.blog_posts;
create policy "Admins can read all blog posts" on public.blog_posts for select using (public.is_admin());
drop policy if exists "Admins can insert blog posts" on public.blog_posts;
create policy "Admins can insert blog posts" on public.blog_posts for insert with check (public.is_admin());
drop policy if exists "Admins can update blog posts" on public.blog_posts;
create policy "Admins can update blog posts" on public.blog_posts for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete blog posts" on public.blog_posts;
create policy "Admins can delete blog posts" on public.blog_posts for delete using (public.is_admin());

drop policy if exists "Admins can upload portfolio assets" on storage.objects;
create policy "Admins can upload portfolio assets"
on storage.objects for insert
with check (bucket_id = 'portfolio' and public.is_admin());

drop policy if exists "Admins can update portfolio assets" on storage.objects;
create policy "Admins can update portfolio assets"
on storage.objects for update
using (bucket_id = 'portfolio' and public.is_admin())
with check (bucket_id = 'portfolio' and public.is_admin());

drop policy if exists "Admins can delete portfolio assets" on storage.objects;
create policy "Admins can delete portfolio assets"
on storage.objects for delete
using (bucket_id = 'portfolio' and public.is_admin());
