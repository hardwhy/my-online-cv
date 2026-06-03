import { KeyboardEvent, ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type DropdownOption = {
  value: string;
  label: string;
  description?: string;
};

const triggerClasses =
  'w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-left text-sm font-semibold text-slate-700 outline-none transition hover:text-slate-950 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-white';

const panelClasses =
  'z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-800 dark:bg-slate-950';

const itemClasses =
  'flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition';

function Chevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M4.5 10.5 8 14l7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MoreIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
    </svg>
  );
}

type AdminSelectProps = {
  label?: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  allowCustomValue?: boolean;
  emptyLabel?: string;
  className?: string;
};

export function AdminSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  searchable = false,
  allowCustomValue = false,
  emptyLabel = 'No options found.',
  className = '',
}: AdminSelectProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedOption = options.find((option) => option.value === value);
  const visibleOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;

    return options.filter((option) =>
      [option.label, option.value, option.description]
        .filter(Boolean)
        .some((part) => part!.toLowerCase().includes(normalizedQuery)),
    );
  }, [options, query]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    window.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => window.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (searchable) window.requestAnimationFrame(() => searchRef.current?.focus());
  }, [isOpen, searchable]);

  const openSelect = () => {
    setActiveIndex(0);
    setIsOpen(true);
    setQuery('');
  };

  const chooseValue = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyboard = (event: KeyboardEvent<HTMLButtonElement | HTMLInputElement>) => {
    if (!isOpen && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openSelect();
      return;
    }

    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, Math.max(visibleOptions.length - 1, 0)));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const activeOption = visibleOptions[activeIndex];
      if (activeOption) {
        chooseValue(activeOption.value);
      } else if (allowCustomValue && query.trim()) {
        chooseValue(query.trim());
      }
    }
  };

  return (
    <div ref={rootRef} className={className}>
      {label ? <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span> : null}
      <div className="relative mt-2">
        <button
          ref={triggerRef}
          className={`${triggerClasses} flex items-center justify-between gap-3`}
          type="button"
          role="combobox"
          aria-controls={`${id}-listbox`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-activedescendant={isOpen && visibleOptions[activeIndex] ? `${id}-option-${visibleOptions[activeIndex].value}` : undefined}
          onClick={() => (isOpen ? setIsOpen(false) : openSelect())}
          onKeyDown={handleKeyboard}
        >
          <span className={selectedOption || value ? 'truncate' : 'truncate text-slate-400'}>
            {selectedOption?.label ?? (value || placeholder)}
          </span>
          <Chevron isOpen={isOpen} />
        </button>

        {isOpen ? (
          <div className={`${panelClasses} absolute left-0 right-0 top-full mt-2`}>
            {searchable ? (
              <div className="border-b border-slate-200 p-2 dark:border-slate-800">
                <input
                  ref={searchRef}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                    if (allowCustomValue) onChange(event.target.value);
                  }}
                  onKeyDown={handleKeyboard}
                  placeholder="Search..."
                  role="searchbox"
                />
              </div>
            ) : null}

            <div id={`${id}-listbox`} className="max-h-72 overflow-y-auto p-1" role="listbox" aria-label={label ?? placeholder}>
              {visibleOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={option.value}
                    id={`${id}-option-${option.value}`}
                    className={`${itemClasses} ${
                      isSelected
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                        : isActive
                          ? 'bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                    }`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => chooseValue(option.value)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{option.label}</span>
                      {option.description ? <span className={`mt-0.5 block truncate text-xs font-medium ${isSelected ? 'text-white/80 dark:text-slate-950/70' : 'text-slate-500 dark:text-slate-400'}`}>{option.description}</span> : null}
                    </span>
                    {isSelected ? <CheckIcon /> : null}
                  </button>
                );
              })}

              {visibleOptions.length === 0 ? <p className="px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400">{emptyLabel}</p> : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type MenuItem = {
  label: string;
  onSelect: () => void;
  tone?: 'default' | 'danger';
};

export function AdminMenu({
  label,
  items,
  children,
}: {
  label: string;
  items: MenuItem[];
  children: ReactNode;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const trigger = triggerRef.current?.getBoundingClientRect();
    if (trigger) {
      setPosition({
        top: trigger.bottom + 8,
        left: Math.max(12, trigger.right - 176),
      });
    }

    const close = (event: PointerEvent) => {
      if (triggerRef.current?.contains(event.target as Node) || menuRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };
    const closeOnViewportChange = () => setIsOpen(false);

    window.addEventListener('pointerdown', close);
    window.addEventListener('scroll', closeOnViewportChange, true);
    window.addEventListener('resize', closeOnViewportChange);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('scroll', closeOnViewportChange, true);
      window.removeEventListener('resize', closeOnViewportChange);
    };
  }, [isOpen]);

  const selectItem = (item: MenuItem) => {
    item.onSelect();
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (!isOpen && ['ArrowDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, items.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectItem(items[activeIndex]);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 transition hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-white"
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
      >
        {children}
      </button>

      {isOpen
        ? createPortal(
            <div
              ref={menuRef}
              className={`${panelClasses} fixed w-44`}
              style={{ top: position.top, left: position.left }}
              role="menu"
              aria-label={label}
              onKeyDown={handleKeyDown}
            >
              {items.map((item, index) => (
                <button
                  key={item.label}
                  className={`${itemClasses} ${
                    index === activeIndex
                      ? item.tone === 'danger'
                        ? 'bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-200'
                        : 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : item.tone === 'danger'
                        ? 'text-red-600 hover:bg-red-50 dark:text-red-200 dark:hover:bg-red-400/10'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-white'
                  }`}
                  type="button"
                  role="menuitem"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectItem(item)}
                >
                  {item.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
