export type ContentSource = 'static' | 'supabase';

const contentSource = import.meta.env.VITE_CONTENT_SOURCE;

export const activeContentSource: ContentSource = contentSource === 'supabase' ? 'supabase' : 'static';
export const isSupabaseContentEnabled = activeContentSource === 'supabase';
