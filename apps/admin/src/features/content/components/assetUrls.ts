import { resolveStoragePath } from '@web-cv-services/shared-services';
import type { StorageUploadTarget } from '@web-cv-services/shared-types';
import { adminSupabase } from '../../../lib/supabase';

export const getPublicAssetUrl = (target: StorageUploadTarget, slug?: string): string | undefined => {
  try {
    const path = resolveStoragePath(target, slug);
    return adminSupabase?.storage.from(target.bucket).getPublicUrl(path).data.publicUrl;
  } catch {
    return undefined;
  }
};
