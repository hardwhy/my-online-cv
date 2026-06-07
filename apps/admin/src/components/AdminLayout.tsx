import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';
import { useTheme, ThemeToggle } from '@web-cv/shared-ui';

const navItems = [
  { to: '/', label: 'Content' },
  { to: '/export', label: 'Export CV' },
];

function PowerIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M10 2.5v7" strokeLinecap="round" />
      <path d="M6.25 5.5a6 6 0 1 0 7.5 0" strokeLinecap="round" />
    </svg>
  );
}

export function AdminLayout() {
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-950 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-700 dark:text-brand-300">Portfolio Admin</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.length > 1 ? (
              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    className={({ isActive }) =>
                      `rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-800 dark:text-brand-200'
                          : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                      }`
                    }
                    to={item.to}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ) : null}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-brand-200 dark:focus:ring-offset-slate-950"
              type="button"
              onClick={() => void signOut()}
              aria-label="Sign out"
            >
              <PowerIcon />
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
