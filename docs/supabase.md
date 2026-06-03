# Supabase Portfolio Content Setup

This portfolio reads public content from Supabase and keeps GitHub Pages as the static host.

## Setup Steps

1. Create a Supabase project.
2. Open the Supabase SQL Editor and run `docs/supabase-schema.sql`.
3. Run `docs/supabase-seed.sql` if you want to import the current static portfolio content.
4. Upload assets to the public `portfolio` storage bucket.
5. Update image and file URL columns manually through the Supabase Dashboard.
6. Add Vite environment variables locally and in the GitHub Pages deployment environment.

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

## Storage Paths

Use predictable folders inside the `portfolio` bucket:

```text
profile/ayi-hardiyanto-profile.webp
projects/{project-slug}/thumbnail.webp
projects/{project-slug}/screenshots/{screenshot-name}.webp
certificates/{certificate-slug}/certificate.pdf
certificates/{certificate-slug}/preview.webp
```

For the simplest maintenance, paste public asset URLs into the matching database URL columns.

## Seed Existing Content

`docs/supabase-seed.sql` migrates the current static TypeScript content into Supabase.

Run order:

```text
1. docs/supabase-schema.sql
2. docs/supabase-seed.sql
```

The seed is a replacement seed: rerunning it deletes rows from the portfolio content tables and inserts the current repo content again. Do not rerun it after editing production content in Supabase Dashboard unless you intentionally want to replace that content.

The seed sets `site_profile.photo_url`, `certifications.download_url`, and `certifications.image_url` to `null` where the final Supabase Storage URLs are not known yet. Upload those files to Storage, copy their public URLs, then update the matching rows in the Dashboard.

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

The frontend uses only the public anon key. RLS is enabled on every table. Public users can only `select` rows where `is_published = true`. There are no frontend insert, update, or delete operations.

Content editing happens manually in the Supabase Dashboard.

## Rollout Notes

The React app still has static content as query `initialData` and fallback data. This keeps the deployed site working while Supabase is being populated. After all Supabase content is verified, the fallback imports can be removed from `src/hooks/usePortfolioContent.ts` and `src/services/portfolioService.ts` if you want the repository to contain no static portfolio content.
