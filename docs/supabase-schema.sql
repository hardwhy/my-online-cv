create extension if not exists pgcrypto;

create table if not exists public.site_profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title text not null,
  summary text not null,
  location text not null,
  email text not null,
  phone text,
  photo_url text,
  stats jsonb not null default '[]',
  strengths text[] not null default '{}',
  interests text[] not null default '{}',
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  href text not null,
  icon text,
  show_in_web boolean not null default true,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Frontend', 'Backend', 'Database', 'Tools')),
  proficiency integer not null check (proficiency between 0 and 100),
  description text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  position text not null,
  duration text not null,
  location text not null,
  summary text not null,
  responsibilities text[] not null default '{}',
  achievements text[] not null default '{}',
  technologies text[] not null default '{}',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('Web App', 'Platform', 'Mobile', 'Publication')),
  description text not null,
  impact text not null,
  thumbnail_url text,
  screenshots text[] not null default '{}',
  technologies text[] not null default '{}',
  github_url text,
  live_url text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text not null,
  issue_date text not null,
  credential_url text,
  download_url text,
  image_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  date text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author text not null,
  role text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  date date not null,
  tags text[] not null default '{}',
  excerpt text not null,
  content text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_site_profile_updated_at on public.site_profile;
create trigger set_site_profile_updated_at before update on public.site_profile
for each row execute function public.set_updated_at();

drop trigger if exists set_skills_updated_at on public.skills;
create trigger set_skills_updated_at before update on public.skills
for each row execute function public.set_updated_at();

drop trigger if exists set_experiences_updated_at on public.experiences;
create trigger set_experiences_updated_at before update on public.experiences
for each row execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists set_certifications_updated_at on public.certifications;
create trigger set_certifications_updated_at before update on public.certifications
for each row execute function public.set_updated_at();

drop trigger if exists set_achievements_updated_at on public.achievements;
create trigger set_achievements_updated_at before update on public.achievements
for each row execute function public.set_updated_at();

drop trigger if exists set_testimonials_updated_at on public.testimonials;
create trigger set_testimonials_updated_at before update on public.testimonials
for each row execute function public.set_updated_at();

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;
create trigger set_blog_posts_updated_at before update on public.blog_posts
for each row execute function public.set_updated_at();

alter table public.site_profile enable row level security;
alter table public.skills enable row level security;
alter table public.experiences enable row level security;
alter table public.projects enable row level security;
alter table public.certifications enable row level security;
alter table public.achievements enable row level security;
alter table public.testimonials enable row level security;
alter table public.blog_posts enable row level security;

drop policy if exists "Public can read published profile" on public.site_profile;
create policy "Public can read published profile" on public.site_profile for select using (is_published = true);

drop policy if exists "Public can read published skills" on public.skills;
create policy "Public can read published skills" on public.skills for select using (is_published = true);

drop policy if exists "Public can read published experiences" on public.experiences;
create policy "Public can read published experiences" on public.experiences for select using (is_published = true);

drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects" on public.projects for select using (is_published = true);

drop policy if exists "Public can read published certifications" on public.certifications;
create policy "Public can read published certifications" on public.certifications for select using (is_published = true);

drop policy if exists "Public can read published achievements" on public.achievements;
create policy "Public can read published achievements" on public.achievements for select using (is_published = true);

drop policy if exists "Public can read published testimonials" on public.testimonials;
create policy "Public can read published testimonials" on public.testimonials for select using (is_published = true);

drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts" on public.blog_posts for select using (is_published = true);

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read portfolio assets" on storage.objects;
create policy "Public can read portfolio assets"
on storage.objects for select
using (bucket_id = 'portfolio');
