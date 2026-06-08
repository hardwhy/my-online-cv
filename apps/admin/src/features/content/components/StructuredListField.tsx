import { useState } from 'react';
import type { StructuredItem } from '../types';

function RemoveIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 6 14 14M14 6 6 14" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path
        d="M11.5 4.5 15.5 8.5M3.5 16.5l4.25-1 8-8a2.12 2.12 0 0 0-3-3l-8 8-1.25 4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const statPresets = [
  { label: 'Years of experience', value: '8+' },
  { label: 'Professional roles', value: '5+' },
  { label: 'Projects count', value: '18+' },
];

export function StructuredListField({
  label,
  value,
  type,
  onChange,
}: {
  label: string;
  value: StructuredItem[];
  type: 'socials' | 'stats';
  onChange: (nextValue: StructuredItem[]) => void;
}) {
  const [draftLabel, setDraftLabel] = useState('');
  const [draftValue, setDraftValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const valueLabel = type === 'socials' ? 'Link' : 'Value';

  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const resetDraft = () => {
    setDraftLabel('');
    setDraftValue('');
    setEditingIndex(null);
    setUrlError(null);
  };

  const saveItem = () => {
    const nextLabel = draftLabel.trim();
    const nextValue = draftValue.trim();
    if (!nextLabel || !nextValue) return;

    if (type === 'socials' && !isValidUrl(nextValue)) {
      setUrlError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setUrlError(null);
    const nextItem =
      type === 'socials' ? { label: nextLabel, href: nextValue } : { label: nextLabel, value: nextValue };
    const nextItems = [...value];
    if (editingIndex === null) {
      nextItems.push(nextItem);
    } else {
      nextItems[editingIndex] = nextItem;
    }
    onChange(nextItems);
    resetDraft();
  };

  const startEdit = (item: StructuredItem, index: number) => {
    setDraftLabel(item.label);
    setDraftValue(type === 'socials' ? (item.href ?? '') : (item.value ?? ''));
    setEditingIndex(index);
    setUrlError(null);
  };

  const addStatPresets = () => {
    const existingLabels = new Set(value.map((item) => item.label.toLowerCase()));
    onChange([...value, ...statPresets.filter((item) => !existingLabels.has(item.label.toLowerCase()))]);
  };

  return (
    <div className="block text-sm font-medium text-slate-700 dark:text-slate-200 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>{label}</span>
        {type === 'stats' ? (
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 transition hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
            type="button"
            onClick={addStatPresets}
          >
            Fill defaults
          </button>
        ) : null}
      </div>
      <div className="mt-2 rounded-2xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
        <div className="grid gap-2 md:grid-cols-[1fr_1.6fr_auto]">
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-950 outline-none transition focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            value={draftLabel}
            onChange={(event) => setDraftLabel(event.target.value)}
            placeholder="Label"
          />
          <input
            className={`rounded-xl border px-4 py-2 text-sm text-slate-950 outline-none transition focus:border-brand-400 dark:bg-slate-900 dark:text-white ${
              urlError && type === 'socials'
                ? 'border-red-400 dark:border-red-500'
                : 'border-slate-200 bg-white dark:border-slate-800'
            }`}
            value={draftValue}
            onChange={(event) => {
              setDraftValue(event.target.value);
              if (urlError) setUrlError(null);
            }}
            placeholder={valueLabel}
            type={type === 'socials' ? 'url' : 'text'}
          />
          <button className="btn-primary" type="button" onClick={saveItem}>
            {editingIndex === null ? 'Add' : 'Update'}
          </button>
        </div>

        {urlError ? (
          <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{urlError}</p>
        ) : null}

        {editingIndex !== null ? (
          <button
            className="mt-2 text-xs font-semibold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            type="button"
            onClick={resetDraft}
          >
            Cancel edit
          </button>
        ) : null}

        {value.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {value.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition ${
                  editingIndex === index
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-950 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-white'
                }`}
                onClick={() => startEdit(item, index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    startEdit(item, index);
                  }
                }}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{item.label}</span>
                  <span
                    className={`block truncate text-xs ${editingIndex === index ? 'text-white/75 dark:text-slate-950/70' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {type === 'socials' ? item.href : item.value}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <EditIcon />
                  <button
                    type="button"
                    className="rounded-full p-1 text-slate-400 transition hover:bg-white hover:text-red-500 dark:hover:bg-slate-950"
                    onClick={(event) => {
                      event.stopPropagation();
                      onChange(value.filter((_, i) => i !== index));
                      if (editingIndex === index) resetDraft();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        onChange(value.filter((_, i) => i !== index));
                      }
                    }}
                    aria-label={`Remove ${item.label}`}
                  >
                    <RemoveIcon />
                  </button>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs font-normal text-slate-500 dark:text-slate-400">Add entries one at a time.</p>
        )}
      </div>
    </div>
  );
}
