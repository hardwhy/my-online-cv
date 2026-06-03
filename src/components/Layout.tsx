import { Suspense, useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useProfile } from '../hooks/usePortfolioContent';
import { useTheme } from '../hooks/useTheme';
import { Analytics } from './Analytics';
import { CommandPalette } from './CommandPalette';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Experience', to: '/experience' },
  { label: 'Projects', to: '/projects' },
  { label: 'Skills', to: '/skills' },
  { label: 'Certifications', to: '/certifications' },
  { label: 'Contact', to: '/contact' },
];

function ContentLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500 dark:border-slate-800 dark:border-t-brand-300" aria-label="Loading page" />
    </div>
  );
}

export function Layout() {
  const { data: profile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isHeroPhotoVisible, setIsHeroPhotoVisible] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const initials = useMemo(
    () =>
      profile.fullName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2),
    [profile.fullName],
  );

  useEffect(() => {
    const heroPhoto = document.querySelector('[data-profile-hero]');
    if (!heroPhoto) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroPhotoVisible(entry.isIntersecting);
      },
      { threshold: 0.15 },
    );

    observer.observe(heroPhoto);
    return () => observer.disconnect();
  }, [location.pathname]);

  const shouldShowProfilePhoto = location.pathname !== '/' || !isHeroPhotoVisible;
  const activeNavItem = navItems.find((item) => item.to === location.pathname) ?? navItems[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Analytics />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <NavLink to="/" className="group flex items-center gap-3">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-950 font-display text-sm font-bold text-white shadow-soft ring-2 ring-slate-200 transition group-hover:-translate-y-0.5 dark:bg-white dark:text-slate-950 dark:ring-slate-700">
              <AnimatePresence mode="wait" initial={false}>
                {shouldShowProfilePhoto ? (
                  <motion.img
                    key="profile-photo"
                    src={profile.photo}
                    alt={profile.fullName}
                    initial={{ opacity: 0, scale: 0.82, rotate: -8 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.82, rotate: 8 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="absolute inset-0 h-full w-full scale-150 rounded-full object-cover object-center"
                  />
                ) : (
                  <motion.span
                    key="profile-initials"
                    initial={{ opacity: 0, scale: 0.82, rotate: 8 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.82, rotate: -8 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    {initials}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <span>
              <span className="block font-display text-base font-bold">{profile.fullName}</span>
              <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">{profile.title}</span>
            </span>
          </NavLink>

          <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-800 dark:text-brand-200'
                      : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <CommandPalette navItems={navItems} />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </nav>
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:hidden lg:px-8" aria-label="Mobile navigation">
          <div className="relative">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-white"
              aria-expanded={isMobileNavOpen}
              onClick={() => setIsMobileNavOpen((isOpen) => !isOpen)}
            >
              <span>{activeNavItem.label}</span>
              <svg
                className={`h-4 w-4 transition ${isMobileNavOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isMobileNavOpen ? (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-800 dark:bg-slate-950">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main id="main">
        <Suspense fallback={<ContentLoader />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>(c) {new Date().getFullYear()} {profile.fullName}. Built with React, TypeScript, Vite, and Tailwind CSS.</p>
          <div className="flex gap-4">
            {profile.socials.map((social) => (
              <a key={social.label} href={social.href} className="font-semibold hover:text-brand-600 dark:hover:text-brand-300">
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
