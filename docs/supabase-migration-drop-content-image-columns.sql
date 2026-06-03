-- Remove image URL fields from portfolio content tables.
-- Images are now resolved by frontend convention from Supabase Storage:
-- - portfolio/profile/ayi-hardiyanto-profile.png
-- - portfolio/projects/{project-slug}/thumbnail.webp
--
-- This migration does not delete or reseed table rows. It only removes the
-- previous content-managed image columns.

begin;

alter table public.site_profile
  drop column if exists photo_url;

alter table public.projects
  drop column if exists thumbnail_url,
  drop column if exists screenshots;

commit;
