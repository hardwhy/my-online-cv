import { FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from './authContext';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const { session, signIn } = useAuth();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (session) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn(email, password);
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 font-sans text-slate-100 antialiased">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-300">Portfolio Admin</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white">Sign in</h1>
        <p className="mt-2 text-sm text-slate-400">Use your Supabase admin account. Access is enforced by RLS policies.</p>

        {!isSupabaseConfigured ? (
          <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            Missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`. Add them before using the admin portal.
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-200">
              Email
              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-300"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-200">
              Password
              <span className="relative mt-2 block">
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-white outline-none transition focus:border-brand-300"
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  className="absolute inset-y-0 right-3 my-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  type="button"
                  onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
                  aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                >
                  {isPasswordVisible ? (
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M3 3l14 14M8.3 8.3A2.4 2.4 0 0 0 10 12.4c.62 0 1.18-.23 1.6-.6M6.1 6.7C4.75 7.5 3.7 8.65 3 10c1.4 2.7 4 4.5 7 4.5 1.15 0 2.23-.25 3.2-.7M9.15 5.57c.28-.04.56-.07.85-.07 3 0 5.6 1.8 7 4.5-.38.73-.86 1.38-1.43 1.94" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M3 10s2.5-4.5 7-4.5S17 10 17 10s-2.5 4.5-7 4.5S3 10 3 10Z" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="10" cy="10" r="2.4" />
                    </svg>
                  )}
                </button>
              </span>
            </label>
            {error ? <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</p> : null}
            <button
              className="w-full btn-primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
