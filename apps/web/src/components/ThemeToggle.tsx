type ThemeToggleProps = {
  theme: 'light' | 'dark';
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-brand-200 dark:focus:ring-offset-slate-950"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span aria-hidden="true">{theme === 'dark' ? 'Moon' : 'Sun'}</span>
      <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  );
}
