import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type CommandPaletteProps = {
  navItems: Array<{ label: string; to: string }>;
};

export function CommandPalette({ navItems }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filteredItems = useMemo(
    () => navItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [navItems, query],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen((current) => !current);
      }

      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const runCommand = (to: string) => {
    navigate(to);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-400 dark:hover:text-brand-200 dark:focus:ring-offset-slate-950 sm:inline-flex"
        aria-label="Open command palette"
      >
        <span>Search</span>
        <kbd className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">Cmd K</kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 px-4 py-24 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
              <label htmlFor="command-search" className="sr-only">
                Search pages
              </label>
              <input
                id="command-search"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pages..."
                className="w-full bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredItems.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => runCommand(item.to)}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-brand-200"
                >
                  {item.label}
                  <span className="text-xs text-slate-400">{item.to}</span>
                </button>
              ))}
              {filteredItems.length === 0 && <p className="px-4 py-6 text-sm text-slate-500">No matching pages found.</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
