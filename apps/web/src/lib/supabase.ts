import { createPortfolioSupabaseClient } from '@web-cv/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createPortfolioSupabaseClient({
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  persistSession: false,
});
