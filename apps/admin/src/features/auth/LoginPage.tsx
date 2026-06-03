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
              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-300"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error ? <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</p> : null}
            <button
              className="w-full rounded-xl bg-brand-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-60"
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
