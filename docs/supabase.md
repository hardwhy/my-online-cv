# Supabase Portfolio Content Setup

This portfolio reads public content from Supabase and keeps GitHub Pages as the static host.

## Setup Steps

1. Create a Supabase project.
2. Open the Supabase SQL Editor and run `docs/supabase-schema.sql`.
3. Run `docs/supabase-seed.sql` if you want to import the current static portfolio content.
4. Run `docs/supabase-admin-policies.sql` if you want to use the admin portal.
5. Upload assets to the public `portfolio` storage bucket.
6. Update image and file URL columns manually through the Supabase Dashboard or admin portal.
7. Add Vite environment variables locally and in the GitHub Pages deployment environment.

## Environment Variables

Use `.env.local` for local development:

```bash
VITE_CONTENT_SOURCE=static
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

`VITE_CONTENT_SOURCE` controls where the app reads portfolio content from:

- `static` uses the TypeScript files in `src/data`. This is the default when the variable is missing.
- `supabase` reads from Supabase and uses static data as the initial/fallback data while queries load.

Restart the Vite dev server after changing `VITE_CONTENT_SOURCE`, because Vite reads environment variables at startup.

Do not commit real `.env` or `.env.local` files. The Supabase publishable key is safe to expose in the browser when Row Level Security policies only allow public reads. Never put the Supabase secret key, service role key, database password, or dashboard credentials in frontend environment variables.

## Admin Portal Setup

The admin portal is a browser-only app. It still uses the public anon key, so all write security depends on Supabase Auth, table RLS, and storage policies.

1. In Supabase Dashboard, enable Email/Password authentication.
2. Create your admin user from `Authentication` -> `Users`.
3. Copy the user's UUID.
4. Run `docs/supabase-admin-policies.sql` in the SQL Editor.
5. Add your user to the allowlist:

```sql
insert into public.app_admins (user_id)
values ('YOUR_AUTH_USER_UUID')
on conflict (user_id) do nothing;
```

After this, the admin app can read drafts, create/update/delete content rows, and upload files to the `portfolio` bucket. Do not add a service role key to `apps/admin`; it must never be exposed in browser environment variables.

## Storage Paths

Use predictable folders inside the `portfolio` bucket:

```text
profile/ayi-hardiyanto-profile.png
projects/{project-slug}/thumbnail.webp
certificates/{certificate-slug}/certificate.pdf
certificates/{certificate-slug}/preview.webp
```

Project and profile images are resolved by frontend convention from Supabase Storage, not from database columns:

- `profile/ayi-hardiyanto-profile.png`
- `projects/{project-slug}/thumbnail.webp`

## Seed Existing Content

`docs/supabase-seed.sql` migrates the current static TypeScript content into Supabase.

Run order:

```text
1. docs/supabase-schema.sql
2. docs/supabase-seed.sql
```

The seed is a replacement seed: rerunning it deletes rows from the portfolio content tables and inserts the current repo content again. Do not rerun it after editing production content in Supabase Dashboard unless you intentionally want to replace that content.

The seed still includes legacy image columns because it matches the original schema. If you run the seed, run `docs/supabase-migration-drop-content-image-columns.sql` afterward to remove profile and project image columns. Certificate file URLs can still be managed through `certifications.download_url` and `certifications.image_url`.

If your database was created before image fields were moved out of content tables, run `docs/supabase-migration-drop-content-image-columns.sql`. It drops only `site_profile.photo_url`, `projects.thumbnail_url`, and `projects.screenshots`; it does not delete content rows.

## Content Model

Normalized tables:

- `skills`
- `experiences`
- `projects`
- `certifications`
- `achievements`
- `testimonials`
- `blog_posts`

Hybrid single-row table:

- `site_profile`

Array or JSON fields are used for small ordered lists like socials, stats, strengths, interests, project technologies, screenshots, and experience bullet points.

## Security Model

The public website uses only the public anon key. RLS is enabled on every table. Public users can only `select` rows where `is_published = true`.

The admin portal also uses the public anon key, but authenticated writes are allowed only when `public.is_admin()` returns true for the signed-in user. The allowlist lives in `public.app_admins`.

## Rollout Notes

The React app still has static content as query `initialData` and fallback data. This keeps the deployed site working while Supabase is being populated. After all Supabase content is verified, the fallback imports can be removed from `src/hooks/usePortfolioContent.ts` and `src/services/portfolioService.ts` if you want the repository to contain no static portfolio content.
