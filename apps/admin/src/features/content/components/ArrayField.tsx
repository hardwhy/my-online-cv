import { useState } from 'react';
import type { AdminFieldConfig } from '@web-cv-services/shared-types';

function RemoveIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 6 14 14M14 6 6 14" strokeLinecap="round" />
    </svg>
  );
}

export function ArrayField({
  field,
  value,
  onChange,
}: {
  field: AdminFieldConfig;
  value: string[];
  onChange: (nextValue: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  const addItem = () => {
    const nextItem = draft.trim();
    if (!nextItem) return;
    onChange([...value, nextItem]);
    setDraft('');
  };

  return (
    <div className="block text-sm font-medium text-slate-700 dark:text-slate-200 lg:col-span-2">
      <span>{field.label}</span>
      <div className="mt-2 rounded-2xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-950 outline-none transition focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addItem();
              }
            }}
            placeholder={`Add ${field.label.toLowerCase()}`}
          />
          <button className="btn-primary" type="button" onClick={addItem}>
            Add
          </button>
        </div>

        {value.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {value.map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {item}
                <button
                  className="rounded-full p-0.5 text-slate-400 transition hover:bg-white hover:text-red-500 dark:hover:bg-slate-950"
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  aria-label={`Remove ${item}`}
                >
                  <RemoveIcon />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs font-normal text-slate-500 dark:text-slate-400">Add items one at a time.</p>
        )}
      </div>
    </div>
  );
}
