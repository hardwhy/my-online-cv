-- 1. Create the new social_links table
CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    href TEXT NOT NULL,
    icon TEXT,
    show_in_web BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow anyone to read published social links
CREATE POLICY "Allow public read access for published social links"
ON public.social_links FOR SELECT
USING (is_published = true);

-- Allow authenticated admins full access
CREATE POLICY "Allow full access for admins"
ON public.social_links FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.app_admins 
    WHERE user_id = auth.uid()
  )
);

-- 4. Data Migration: Extract existing socials from site_profile
INSERT INTO public.social_links (slug, label, href, is_published, show_in_web)
SELECT 
    lower(regexp_replace(social->>'label', '[^a-zA-Z0-9]+', '-', 'g')),
    social->>'label',
    social->>'href',
    true,
    true
FROM (
    SELECT jsonb_array_elements(socials) as social
    FROM public.site_profile
    WHERE socials IS NOT NULL AND jsonb_array_length(socials) > 0
) as existing_socials
ON CONFLICT (slug) DO NOTHING;

-- 5. Cleanup: Remove the old socials and resume_url columns from site_profile
-- Note: resume_url is now handled via direct storage paths in the web app
ALTER TABLE public.site_profile DROP COLUMN IF EXISTS socials;
ALTER TABLE public.site_profile DROP COLUMN IF EXISTS resume_url;

-- 6. Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_social_links_updated_at
    BEFORE UPDATE ON public.social_links
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
