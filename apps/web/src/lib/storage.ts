import { supabase } from './supabase';

const portfolioBucket = 'portfolio';
const localAssetPath = (filename: string) => `${import.meta.env.BASE_URL}assets/${filename}`;

const getPublicStorageUrl = (path: string) => {
  if (!supabase) return undefined;
  return supabase.storage.from(portfolioBucket).getPublicUrl(path).data.publicUrl;
};

export const getProfilePhotoUrl = () => getPublicStorageUrl('profile/ayi-hardiyanto-profile.png') ?? localAssetPath('ayi-hardiyanto-profile.png');

export const getProjectThumbnailUrl = (slug: string) => getPublicStorageUrl(`projects/${slug}/thumbnail.webp`);
