import { supabase } from './supabase';

const portfolioBucket = 'portfolio';
const localAssetPath = (filename: string) => `${import.meta.env.BASE_URL}assets/${filename}`;

const getPublicStorageUrl = (path: string) => {
  if (!supabase) return undefined;
  return supabase.storage.from(portfolioBucket).getPublicUrl(path).data.publicUrl;
};

export const getProfilePhotoUrl = () => getPublicStorageUrl('profile/ayi-hardiyanto-profile.png') ?? localAssetPath('ayi-hardiyanto-profile.png');

export const getCvDownloadUrl = () => getPublicStorageUrl('cv/ayi-hardiyanto-cv.pdf') ?? localAssetPath('ayi-hardiyanto-cv.pdf');

// Supabase CDN caches aggressively. Appending a daily timestamp busts the cache
// after an admin re-upload without hammering storage on every render.
const dailyCacheBuster = () => Math.floor(Date.now() / (1000 * 60 * 60 * 24));

export const getProjectThumbnailUrl = (slug: string) => {
  const base = getPublicStorageUrl(`projects/${slug}/thumbnail.webp`);
  if (!base) return undefined;
  return `${base}?v=${dailyCacheBuster()}`;
};
