import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';

const navItems = [
  { to: '/', label: 'Content' },
  { to: '/storage', label: 'Storage' },
];

export function AdminLayout() {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-700 dark:text-brand-300">Portfolio Admin</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-slate-950 text-white dark:bg-brand-300 dark:text-slate-950'
                      : 'border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300'
                  }`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
            <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200" type="button" onClick={() => void signOut()}>
              Sign out
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
