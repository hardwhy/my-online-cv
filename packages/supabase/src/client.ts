import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type PortfolioSupabaseClient = SupabaseClient;

export type PortfolioSupabaseClientOptions = {
  url: string | undefined;
  anonKey: string | undefined;
  persistSession?: boolean;
};

export function hasSupabaseConfig(options: PortfolioSupabaseClientOptions) {
  return Boolean(options.url && options.anonKey);
}

export function createPortfolioSupabaseClient({
  url,
  anonKey,
  persistSession = false,
}: PortfolioSupabaseClientOptions): PortfolioSupabaseClient | null {
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: persistSession,
      persistSession,
    },
  });
}
