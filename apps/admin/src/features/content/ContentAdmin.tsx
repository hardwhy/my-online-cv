import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminTableConfigs,
  createAdminRecord,
  deleteAdminRecord,
  listAdminRecords,
  removePortfolioAsset,
  resolveStoragePath,
  storageUploadTargets,
  updateAdminRecord,
  uploadPortfolioAsset,
} from '@web-cv-services/shared-services';
import type { AdminFieldConfig, AdminRecord, AdminRecordValue, AdminTableConfig, StorageTargetKind, StorageUploadTarget } from '@web-cv-services/shared-types';
import { AdminMenu, AdminSelect, MoreIcon } from '../../components/AdminDropdown';
import { adminSupabase } from '../../lib/supabase';

type StructuredItem = {
  label: string;
  value?: string;
  href?: string;
};

type FormState = Record<string, string | boolean | string[] | StructuredItem[]>;
type ProjectVisualKind = 'mobile' | 'web' | 'terminal';
type PendingAssetChange = {
  file?: File;
  remove?: boolean;
};

const localAssetPath = (filename: string) => `${import.meta.env.BASE_URL}assets/${filename}`;

const tableFilterColumns: Partial<Record<string, string[]>> = {
  social_links: ['label', 'status'],
  skills: ['name', 'category', 'status'],
  experiences: ['company', 'position', 'status'],
  projects: ['title', 'category', 'status'],
  certifications: ['name', 'issuer', 'status'],
  achievements: ['title', 'status'],
  testimonials: ['author', 'role', 'status'],
  blog_posts: ['title', 'status'],
};

const editableFields = (config: AdminTableConfig) => config.fields.filter((field) => !field.readOnly);

const stringifyFieldValue = (field: AdminFieldConfig, value: AdminRecordValue | undefined): string | boolean | string[] | StructuredItem[] => {
  if (field.kind === 'boolean') return Boolean(value ?? field.defaultValue ?? false);
  if (field.kind === 'array') return Array.isArray(value) ? value.map(String) : [];
  if (field.column === 'socials') {
    return Array.isArray(value) ? (value as StructuredItem[]) : [];
  }
  if (field.column === 'stats') {
    return Array.isArray(value) ? (value as StructuredItem[]) : [];
  }
  if (field.kind === 'json') return JSON.stringify(value ?? field.defaultValue ?? [], null, 2);
  if (field.kind === 'number') return String(value ?? field.defaultValue ?? 0);
  return String(value ?? field.defaultValue ?? '');
};

const createInitialFormState = (config: AdminTableConfig, record?: AdminRecord | null): FormState =>
  editableFields(config).reduce<FormState>((state, field) => {
    state[field.column] = stringifyFieldValue(field, record?.[field.column] as AdminRecordValue | undefined);
    return state;
  }, {});

const parseFieldValue = (field: AdminFieldConfig, value: string | boolean | string[] | StructuredItem[]): AdminRecordValue => {
  if (field.kind === 'boolean') return Boolean(value);
  if (field.kind === 'number') return Number(value);
  if (field.kind === 'array') {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
    }

    return String(value)
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (field.column === 'socials' && Array.isArray(value)) {
    return (value as StructuredItem[])
      .map((item) => ({ label: item.label.trim(), href: (item.href ?? item.value ?? '').trim() }))
      .filter((item) => item.label && item.href);
  }
  if (field.column === 'stats' && Array.isArray(value)) {
    return (value as StructuredItem[])
      .map((item) => ({ label: item.label.trim(), value: (item.value ?? '').trim() }))
      .filter((item) => item.label && item.value);
  }
  if (field.kind === 'json') {
    const rawValue = String(value).trim();
    return rawValue ? (JSON.parse(rawValue) as AdminRecordValue) : [];
  }
  return String(value).trim() || null;
};

const asArrayValue = (value: string | boolean | string[] | StructuredItem[] | undefined) => (Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : []);

const asStructuredItems = (value: string | boolean | string[] | StructuredItem[] | undefined): StructuredItem[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'object') ? (value as StructuredItem[]) : [];

const getPublicAssetUrl = (target: StorageUploadTarget, slug?: string) => {
  try {
    const path = resolveStoragePath(target, slug);
    return adminSupabase?.storage.from(target.bucket).getPublicUrl(path).data.publicUrl;
  } catch {
    return undefined;
  }
};

const getStorageTarget = (kind: StorageTargetKind) => storageUploadTargets.find((target) => target.kind === kind);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const cloneAdminRecordValue = (value: AdminRecordValue | undefined): AdminRecordValue | undefined => {
  if (Array.isArray(value)) {
    return value.map((item) => (item && typeof item === 'object' ? { ...(item as Record<string, unknown>) } : item)) as AdminRecordValue;
  }

  if (value && typeof value === 'object') return { ...value };
  return value;
};

const createUniqueCopyValue = (value: string, existingValues: string[], formatCopy: (base: string, copyNumber: number) => string) => {
  const base = value.trim() || 'record';
  const existing = new Set(existingValues.map((existingValue) => existingValue.toLowerCase()));
  let copyNumber = 1;
  let candidate = formatCopy(base, copyNumber);

  while (existing.has(candidate.toLowerCase())) {
    copyNumber += 1;
    candidate = formatCopy(base, copyNumber);
  }

  return candidate;
};

const createDuplicateRecordPayload = (config: AdminTableConfig, record: AdminRecord, records: AdminRecord[]): AdminRecord => {
  const payload = editableFields(config).reduce<AdminRecord>((nextRecord, field) => {
    nextRecord[field.column] = cloneAdminRecordValue(record[field.column] as AdminRecordValue | undefined);
    return nextRecord;
  }, {});
  const existingValuesFor = (column: string) => records.map((nextRecord) => nextRecord[column]).filter((value): value is string => typeof value === 'string');

  if (typeof payload.slug === 'string') {
    payload.slug = createUniqueCopyValue(slugify(payload.slug) || 'record', existingValuesFor('slug'), (base, copyNumber) => `${base}-copy${copyNumber === 1 ? '' : `-${copyNumber}`}`);
  }

  const labelColumn = ['title', 'name', 'company', 'author', 'full_name'].find((column) => typeof payload[column] === 'string');
  if (labelColumn && typeof payload[labelColumn] === 'string') {
    payload[labelColumn] = createUniqueCopyValue(payload[labelColumn], existingValuesFor(labelColumn), (base, copyNumber) => `${base} (copy${copyNumber === 1 ? '' : ` ${copyNumber}`})`);
  }

  if (config.fields.some((field) => field.column === 'is_published')) {
    payload.is_published = false;
  }

  return payload;
};

const getProjectFallbackImage = (record: AdminRecord) => {
  const kind = getProjectVisualKind(record);
  if (kind === 'mobile') return localAssetPath('fallback-mobile-platforms.png');
  if (kind === 'web') return localAssetPath('fallback-web-react-typescript.png');
  return undefined;
};

const getProjectVisualKind = (record: AdminRecord): ProjectVisualKind => {
  const category = String(record.category ?? '').toLowerCase();
  const technologies = Array.isArray(record.technologies) ? record.technologies.join(' ').toLowerCase() : '';

  if (category === 'mobile' || /android|ios|flutter|dart/.test(technologies)) {
    return 'mobile';
  }

  if (category === 'platform' || /backend|api|cli|terminal|java|maven|docker|jenkins|express|node|python|nx/.test(technologies)) {
    return 'terminal';
  }

  return 'web';
};

const isProjectTerminalFallback = (record: AdminRecord) => {
  return getProjectVisualKind(record) === 'terminal';
};

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
      <path d="M11.5 4.5 15.5 8.5M3.5 16.5l4.25-1 8-8a2.12 2.12 0 0 0-3-3l-8 8-1.25 4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlaceholderImage({ label = 'No image' }: { label?: string }) {
  return (
    <div className="flex h-full min-h-16 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-100 text-xs font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
      <div className="text-center">
        <svg className="mx-auto mb-1 h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5v-9Z" />
          <path d="m4.5 13 3.25-3 2.5 2.25 2-1.75L15.5 13" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12.75" cy="7.25" r="1" />
        </svg>
        {label}
      </div>
    </div>
  );
}

function TerminalFallbackThumb() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 p-2">
      <div className="w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
        <div className="flex gap-1 border-b border-slate-800 px-2 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </div>
        <div className="space-y-1 p-2 font-mono text-[8px] font-semibold text-brand-200">
          <p>$ build</p>
          <p className="text-emerald-300">200 OK</p>
        </div>
      </div>
    </div>
  );
}

function ImagePreviewOverlay({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 cursor-default" type="button" onClick={onClose} aria-label="Close preview" />
      <div className="relative max-h-full w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <p className="text-sm font-bold text-white">{title}</p>
          <button className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white" type="button" onClick={onClose} aria-label="Close preview">
            <RemoveIcon />
          </button>
        </div>
        <div className="max-h-[78vh] overflow-auto p-4">
          <img className="mx-auto max-h-[72vh] rounded-2xl object-contain" src={src} alt={title} />
        </div>
      </div>
    </div>
  );
}

function ArrayField({
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
          <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700 dark:bg-brand-300 dark:text-slate-950" type="button" onClick={addItem}>
            Add
          </button>
        </div>

        {value.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {value.map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {item}
                <button
                  className="rounded-full p-0.5 text-slate-400 transition hover:bg-white hover:text-red-500 dark:hover:bg-slate-950"
                  type="button"
                  onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
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

function StructuredListField({
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
  const valueLabel = type === 'socials' ? 'Link' : 'Value';
  const presets = [
    { label: 'Years of experience', value: '8+' },
    { label: 'Professional roles', value: '5+' },
    { label: 'Projects count', value: '18+' },
  ];

  const resetDraft = () => {
    setDraftLabel('');
    setDraftValue('');
    setEditingIndex(null);
  };

  const saveItem = () => {
    const nextLabel = draftLabel.trim();
    const nextValue = draftValue.trim();
    if (!nextLabel || !nextValue) return;

    const nextItem = type === 'socials' ? { label: nextLabel, href: nextValue } : { label: nextLabel, value: nextValue };
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
  };

  const addStatPresets = () => {
    const existingLabels = new Set(value.map((item) => item.label.toLowerCase()));
    onChange([...value, ...presets.filter((item) => !existingLabels.has(item.label.toLowerCase()))]);
  };

  return (
    <div className="block text-sm font-medium text-slate-700 dark:text-slate-200 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>{label}</span>
        {type === 'stats' ? (
          <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 transition hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white" type="button" onClick={addStatPresets}>
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
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-950 outline-none transition focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            placeholder={valueLabel}
            type={type === 'socials' ? 'url' : 'text'}
          />
          <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700 dark:bg-white dark:text-slate-950" type="button" onClick={saveItem}>
            {editingIndex === null ? 'Add' : 'Update'}
          </button>
        </div>

        {editingIndex !== null ? (
          <button className="mt-2 text-xs font-semibold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white" type="button" onClick={resetDraft}>
            Cancel edit
          </button>
        ) : null}

        {value.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {value.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition ${
                  editingIndex === index ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-700 hover:text-slate-950 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-white'
                }`}
                onClick={() => startEdit(item, index)}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{item.label}</span>
                  <span className={`block truncate text-xs ${editingIndex === index ? 'text-white/75 dark:text-slate-950/70' : 'text-slate-500 dark:text-slate-400'}`}>{type === 'socials' ? item.href : item.value}</span>
                </span>
                <span className="flex items-center gap-2">
                  <EditIcon />
                  <button
                    type="button"
                    className="rounded-full p-1 text-slate-400 transition hover:bg-white hover:text-red-500 dark:hover:bg-slate-950"
                    onClick={(event) => {
                      event.stopPropagation();
                      onChange(value.filter((_, itemIndex) => itemIndex !== index));
                      if (editingIndex === index) resetDraft();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        onChange(value.filter((_, itemIndex) => itemIndex !== index));
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

function AssetField({
  target,
  slug,
  value,
  pendingChange,
  onPendingChange,
}: {
  target: StorageUploadTarget;
  slug?: string;
  value?: string;
  pendingChange?: PendingAssetChange;
  onPendingChange: (change: PendingAssetChange | null) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const [previewOverlayUrl, setPreviewOverlayUrl] = useState<string | null>(null);
  const file = pendingChange?.file ?? null;
  const message = pendingChange?.file ? 'Asset upload will run when you save the record.' : pendingChange?.remove ? 'Asset removal will run when you save the record.' : null;
  const publicUrl = value || getPublicAssetUrl(target, slug);
  const previewUrl = publicUrl ? `${publicUrl}${publicUrl.includes('?') ? '&' : '?'}v=${slug ?? 'profile'}` : undefined;
  const isImage = target.accept.startsWith('image/');
  const selectedPreviewUrl = useMemo(() => (file && isImage ? URL.createObjectURL(file) : null), [file, isImage]);
  const displayPreviewUrl = selectedPreviewUrl ?? (!pendingChange?.remove && !imageError ? previewUrl : undefined);

  useEffect(() => {
    if (!selectedPreviewUrl) return;
    return () => URL.revokeObjectURL(selectedPreviewUrl);
  }, [selectedPreviewUrl]);

  const queueRemove = async () => {
    if (!window.confirm(`Remove ${target.label}?`)) return;
    onPendingChange({ remove: true });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{target.label}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{target.pathTemplate}</p>
        </div>
        {isImage ? (
          <button className="min-h-16 max-w-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800" type="button" onClick={() => displayPreviewUrl && setPreviewOverlayUrl(displayPreviewUrl)} disabled={!displayPreviewUrl}>
            {displayPreviewUrl ? <img className="max-h-24 w-auto max-w-full object-contain" src={displayPreviewUrl} alt={target.label} onError={() => setImageError(true)} /> : <PlaceholderImage />}
          </button>
        ) : null}
      </div>
      <input
        className="mt-3 w-full rounded-xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        type="file"
        accept={target.accept}
        onChange={(event) => {
          const nextFile = event.target.files?.[0] ?? null;
          onPendingChange(nextFile ? { file: nextFile } : null);
          setImageError(false);
        }}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-400/30 dark:text-red-200 dark:hover:bg-red-400/10" type="button" onClick={queueRemove} disabled={target.requiresSlug && !slug}>
          Remove on save
        </button>
        {pendingChange ? (
          <button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white" type="button" onClick={() => onPendingChange(null)}>
            Clear pending change
          </button>
        ) : null}
      </div>
      {target.requiresSlug && !slug ? <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">Enter a slug before uploading.</p> : null}
      {message ? <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">{message}</p> : null}
      {previewOverlayUrl ? <ImagePreviewOverlay src={previewOverlayUrl} title={target.label} onClose={() => setPreviewOverlayUrl(null)} /> : null}
    </div>
  );
}

const displayValue = (value: AdminRecordValue | undefined) => {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value && typeof value === 'object') return JSON.stringify(value);
  return value === null || value === undefined || value === '' ? '-' : String(value);
};

const formatAdminDate = (value: AdminRecordValue | undefined) => {
  if (!value) return '-';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return displayValue(value);
  return date.toLocaleDateString('en-US');
};

function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isPublished ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
      {isPublished ? 'Published' : 'Draft'}
    </span>
  );
}

const getRecordThumbnailUrl = (config: AdminTableConfig, record: AdminRecord) => {
  if (config.name === 'projects') {
    const target = getStorageTarget('project-thumbnail');
    return target ? getPublicAssetUrl(target, String(record.slug ?? '')) : undefined;
  }

  if (config.name === 'certifications') {
    return typeof record.image_url === 'string' ? record.image_url : undefined;
  }

  return undefined;
};

function RecordPreviewCell({ config, record, onPreview }: { config: AdminTableConfig; record: AdminRecord; onPreview: (preview: { src: string; title: string }) => void }) {
  const [failedThumbnailUrl, setFailedThumbnailUrl] = useState<string | null>(null);
  const thumbnailUrl = getRecordThumbnailUrl(config, record);
  const fallbackUrl = config.name === 'projects' ? getProjectFallbackImage(record) : undefined;
  const displayUrl = thumbnailUrl && failedThumbnailUrl !== thumbnailUrl ? thumbnailUrl : fallbackUrl;

  if (displayUrl) {
    return (
      <button
        className="flex h-14 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800"
        type="button"
        onClick={() =>
          onPreview({
            src: displayUrl,
            title: String(record.title ?? record.name ?? 'Preview'),
          })
        }
      >
        <img className="h-full w-full object-cover" src={displayUrl} alt="" onError={() => thumbnailUrl && setFailedThumbnailUrl(thumbnailUrl)} />
      </button>
    );
  }

  if (config.name === 'projects' && isProjectTerminalFallback(record)) {
    return (
      <div className="h-14 w-20 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <TerminalFallbackThumb />
      </div>
    );
  }

  return (
    <div className="h-14 w-20">
      <PlaceholderImage />
    </div>
  );
}

function RecordForm({
  config,
  record,
  onCancel,
  onSubmit,
}: {
  config: AdminTableConfig;
  record: AdminRecord | null;
  onCancel: () => void;
  onSubmit: (record: AdminRecord) => Promise<void>;
}) {
  const [formState, setFormState] = useState<FormState>(() => createInitialFormState(config, record));
  const [assetChanges, setAssetChanges] = useState<Partial<Record<StorageTargetKind, PendingAssetChange>>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const projectSlug = typeof formState.slug === 'string' ? formState.slug : '';
  const certificateSlug = slugify([formState.name, formState.issuer].filter((item) => typeof item === 'string' && item).join('-'));

  const setPendingAssetChange = (kind: StorageTargetKind, change: PendingAssetChange | null) => {
    setAssetChanges((current) => {
      const nextChanges = { ...current };
      if (change) {
        nextChanges[kind] = change;
      } else {
        delete nextChanges[kind];
      }
      return nextChanges;
    });
  };

  const getAssetSlug = (target: StorageUploadTarget, payload: AdminRecord) => {
    if (target.kind === 'project-thumbnail' || target.kind === 'social-icon') return typeof payload.slug === 'string' ? payload.slug : '';
    if (target.kind === 'certificate-file' || target.kind === 'certificate-preview') {
      return slugify([payload.name, payload.issuer].filter((item) => typeof item === 'string' && item).join('-'));
    }
    return undefined;
  };

  const applyPendingAssetChanges = async (payload: AdminRecord) => {
    const urlColumns: Partial<Record<StorageTargetKind, string>> = {
      'social-icon': 'icon',
      'certificate-file': 'download_url',
      'certificate-preview': 'image_url',
    };

    for (const [kind, change] of Object.entries(assetChanges) as [StorageTargetKind, PendingAssetChange][]) {
      const target = getStorageTarget(kind);
      if (!target || !change) continue;

      const slug = getAssetSlug(target, payload);
      const urlColumn = urlColumns[kind];

      if (change.remove) {
        await removePortfolioAsset(adminSupabase, target, slug);
        if (urlColumn) payload[urlColumn] = null;
      }

      if (change.file) {
        const result = await uploadPortfolioAsset(adminSupabase, target, change.file, slug);
        if (urlColumn) payload[urlColumn] = result.publicUrl;
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = editableFields(config).reduce<AdminRecord>((nextRecord, field) => {
        nextRecord[field.column] = parseFieldValue(field, formState[field.column]);
        return nextRecord;
      }, {});
      await applyPendingAssetChanges(payload);
      await onSubmit(payload);
      setAssetChanges({});
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900" onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-950 dark:text-white">{record?.id ? 'Edit record' : 'Create record'}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{config.label}</p>
        </div>
        <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {editableFields(config).map((field) => {
          const value = formState[field.column];
          const commonClasses =
            'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-950 outline-none transition focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white';

          if (field.kind === 'boolean') {
            return (
              <label key={field.column} className="flex h-10 items-center gap-3 self-end text-sm font-medium text-slate-700 dark:text-slate-200">
                <input
                  className="h-4 w-4 rounded border-slate-300 accent-slate-950 dark:border-slate-700 dark:accent-white"
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(event) => setFormState((current) => ({ ...current, [field.column]: event.target.checked }))}
                />
                {field.label}
              </label>
            );
          }

          if (field.column === 'socials' || field.column === 'stats') {
            return (
              <StructuredListField
                key={field.column}
                label={field.label}
                type={field.column}
                value={asStructuredItems(value)}
                onChange={(nextValue) => setFormState((current) => ({ ...current, [field.column]: nextValue }))}
              />
            );
          }

          if (field.kind === 'select') {
            return (
              <AdminSelect
                key={field.column}
                label={field.label}
                value={String(value)}
                options={(field.options ?? []).map((option) => ({ label: option, value: option }))}
                onChange={(nextValue) => setFormState((current) => ({ ...current, [field.column]: nextValue }))}
                placeholder="Select..."
              />
            );
          }

          if (field.kind === 'array') {
            return (
              <ArrayField
                key={field.column}
                field={field}
                value={asArrayValue(value)}
                onChange={(nextValue) => setFormState((current) => ({ ...current, [field.column]: nextValue }))}
              />
            );
          }

          const isLarge = field.kind === 'textarea' || field.kind === 'json';
          return (
            <label key={field.column} className={isLarge ? 'block text-sm font-medium text-slate-700 dark:text-slate-200 lg:col-span-2' : 'block text-sm font-medium text-slate-700 dark:text-slate-200'}>
              {field.label}
              {isLarge ? (
                <textarea
                  className={commonClasses}
                  rows={field.kind === 'json' ? 8 : 5}
                  value={String(value)}
                  onChange={(event) => setFormState((current) => ({ ...current, [field.column]: event.target.value }))}
                  required={field.required}
                />
              ) : (
                <input
                  className={commonClasses}
                  type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : 'text'}
                  value={String(value)}
                  onChange={(event) => setFormState((current) => ({ ...current, [field.column]: event.target.value }))}
                  required={field.required}
                />
              )}
            </label>
          );
        })}
      </div>

      {String(config.name) === 'site_profile' || String(config.name) === 'projects' || String(config.name) === 'certifications' || String(config.name) === 'social_links' ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {String(config.name) === 'site_profile' && getStorageTarget('profile') ? <AssetField target={getStorageTarget('profile')!} pendingChange={assetChanges.profile} onPendingChange={(change) => setPendingAssetChange('profile', change)} /> : null}
          {String(config.name) === 'social_links' && getStorageTarget('social-icon') ? (
            <AssetField
              target={getStorageTarget('social-icon')!}
              slug={typeof formState.slug === 'string' ? formState.slug : ''}
              value={typeof formState.icon === 'string' ? formState.icon : undefined}
              pendingChange={assetChanges['social-icon']}
              onPendingChange={(change) => setPendingAssetChange('social-icon', change)}
            />
          ) : null}
          {String(config.name) === 'projects' && getStorageTarget('project-thumbnail') ? (
            <AssetField target={getStorageTarget('project-thumbnail')!} slug={projectSlug} pendingChange={assetChanges['project-thumbnail']} onPendingChange={(change) => setPendingAssetChange('project-thumbnail', change)} />
          ) : null}
          {String(config.name) === 'certifications' && getStorageTarget('certificate-file') ? (
            <AssetField
              target={getStorageTarget('certificate-file')!}
              slug={certificateSlug}
              value={typeof formState.download_url === 'string' ? formState.download_url : undefined}
              pendingChange={assetChanges['certificate-file']}
              onPendingChange={(change) => setPendingAssetChange('certificate-file', change)}
            />
          ) : null}
          {String(config.name) === 'certifications' && getStorageTarget('certificate-preview') ? (
            <AssetField
              target={getStorageTarget('certificate-preview')!}
              slug={certificateSlug}
              value={typeof formState.image_url === 'string' ? formState.image_url : undefined}
              pendingChange={assetChanges['certificate-preview']}
              onPendingChange={(change) => setPendingAssetChange('certificate-preview', change)}
            />
          ) : null}
        </div>
      ) : null}

      {error ? <p className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100">{error}</p> : null}

      <button className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60 dark:bg-brand-300 dark:text-slate-950" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save record'}
      </button>
    </form>
  );
}

export function ContentAdmin() {
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLDivElement>(null);
  const [tableName, setTableName] = useState(adminTableConfigs[0].name);
  const [editingRecord, setEditingRecord] = useState<AdminRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [tableFilters, setTableFilters] = useState<Record<string, string>>({});
  const [previewOverlay, setPreviewOverlay] = useState<{ src: string; title: string } | null>(null);
  const config = useMemo(() => adminTableConfigs.find((table) => table.name === tableName) ?? adminTableConfigs[0], [tableName]);
  const queryKey = ['admin-content', config.name];

  const recordsQuery = useQuery({
    queryKey,
    queryFn: () => listAdminRecords(adminSupabase, config),
  });
  const records = recordsQuery.data ?? [];
  const publishedProfileRecords = config.name === 'site_profile' ? records.filter((record) => Boolean(record.is_published)) : [];

  const draftOtherProfiles = async (publishedRecordId: string) => {
    await Promise.all(
      records
        .filter((record) => String(record.id) !== publishedRecordId && Boolean(record.is_published))
        .map((record) => updateAdminRecord(adminSupabase, 'site_profile', String(record.id), { is_published: false })),
    );
  };

  const saveMutation = useMutation({
    mutationFn: async (record: AdminRecord) => {
      if (config.name !== 'site_profile') {
        if (editingRecord?.id) return updateAdminRecord(adminSupabase, config.name, editingRecord.id, record);
        return createAdminRecord(adminSupabase, config.name, record);
      }

      const currentRecordId = editingRecord?.id ? String(editingRecord.id) : undefined;
      const nextIsPublished = Boolean(record.is_published);
      const hasOtherPublishedProfile = publishedProfileRecords.some((profile) => String(profile.id) !== currentRecordId);

      if (!nextIsPublished && !hasOtherPublishedProfile) {
        throw new Error('At least one profile record must stay published.');
      }

      const savedRecord = currentRecordId ? await updateAdminRecord(adminSupabase, config.name, currentRecordId, record) : await createAdminRecord(adminSupabase, config.name, record);

      if (nextIsPublished && savedRecord.id) {
        await draftOtherProfiles(String(savedRecord.id));
      }

      return savedRecord;
    },
    onSuccess: async () => {
      setEditingRecord(null);
      setIsCreating(false);
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (record: AdminRecord) => {
      if (config.name === 'site_profile' && record.is_published && publishedProfileRecords.length <= 1) {
        throw new Error('At least one profile record must stay published.');
      }

      await deleteAdminRecord(adminSupabase, config.name, String(record.id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (deleteError) => {
      window.alert(deleteError instanceof Error ? deleteError.message : 'Unable to delete record.');
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async (record: AdminRecord) => {
      if (config.name !== 'site_profile') {
        return updateAdminRecord(adminSupabase, config.name, String(record.id), {
          is_published: !record.is_published,
        });
      }

      if (record.is_published && publishedProfileRecords.length <= 1) {
        throw new Error('At least one profile record must stay published.');
      }

      const updatedRecord = await updateAdminRecord(adminSupabase, config.name, String(record.id), {
        is_published: !record.is_published,
      });

      if (!record.is_published) {
        await draftOtherProfiles(String(record.id));
      }

      return updatedRecord;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (publishError) => {
      window.alert(publishError instanceof Error ? publishError.message : 'Unable to update publish status.');
    },
  });

  const visibleFields = config.fields.filter((field) => field.column !== 'is_published').slice(0, 4);
  const canDelete = config.name === 'site_profile' || config.supportsDelete !== false;
  const showsThumbnail = config.name === 'projects' || config.name === 'certifications';
  const configuredFilterColumns = tableFilterColumns[config.name] ?? [];
  const filterableFields = configuredFilterColumns
    .filter((column) => column !== 'status')
    .map((column) => config.fields.find((field) => field.column === column))
    .filter((field): field is AdminFieldConfig => Boolean(field));
  const hasStatusFilter = configuredFilterColumns.includes('status');
  const filteredRecords = records.filter((record) => {
    const matchesFields = filterableFields.every((field) => {
      const filterValue = tableFilters[field.column]?.trim().toLowerCase();
      if (!filterValue) return true;
      const recordValue = displayValue(record[field.column] as AdminRecordValue | undefined).toLowerCase();
      return recordValue.includes(filterValue);
    });

    const statusFilter = hasStatusFilter ? tableFilters.status : '';
    const matchesStatus = !statusFilter || statusFilter === 'all' || (statusFilter === 'published' ? Boolean(record.is_published) : !record.is_published);
    return matchesFields && matchesStatus;
  });
  const duplicateRecord = (record: AdminRecord) => {
    setEditingRecord(createDuplicateRecordPayload(config, record, records));
    setIsCreating(true);
  };

  useEffect(() => {
    if (!isCreating && !editingRecord) return;
    window.requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [editingRecord, isCreating]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">Content</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-slate-950 dark:text-white">Portfolio CMS</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{config.description}</p>
          </div>
          <button
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 dark:bg-brand-300 dark:text-slate-950"
            type="button"
            onClick={() => {
              setEditingRecord(null);
              setIsCreating(true);
            }}
          >
            New {config.label}
          </button>
        </div>

        <AdminSelect
          className="mt-6 max-w-sm"
          label="Content type"
          value={config.name}
          options={adminTableConfigs.map((table) => ({ label: table.label, value: table.name, description: table.description }))}
          onChange={(nextValue) => {
            setTableName(nextValue as typeof tableName);
            setEditingRecord(null);
            setIsCreating(false);
            setTableFilters({});
          }}
        />
      </div>

      {isCreating || editingRecord ? (
        <div ref={formRef} className="scroll-mt-24">
          <RecordForm
            key={`${config.name}-${editingRecord?.id ?? (editingRecord ? JSON.stringify(editingRecord) : 'new')}`}
            config={config}
            record={editingRecord}
            onCancel={() => {
              setEditingRecord(null);
              setIsCreating(false);
            }}
            onSubmit={async (record) => {
              await saveMutation.mutateAsync(record);
            }}
          />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {recordsQuery.isLoading ? <p className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading records...</p> : null}
        {recordsQuery.error ? <p className="p-6 text-sm text-red-600 dark:text-red-300">{recordsQuery.error.message}</p> : null}
        {!recordsQuery.isLoading && !recordsQuery.error ? (
          <div>
            {configuredFilterColumns.length > 0 ? (
              <div className="grid gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:grid-cols-4">
                {filterableFields.map((field) =>
                  field.kind === 'select' ? (
                    <AdminSelect
                      key={field.column}
                      label={field.label}
                      value={tableFilters[field.column] || 'all'}
                      options={[{ label: 'All', value: 'all' }, ...(field.options ?? []).map((option) => ({ label: option, value: option }))]}
                      onChange={(nextValue) => setTableFilters((current) => ({ ...current, [field.column]: nextValue === 'all' ? '' : nextValue }))}
                    />
                  ) : (
                    <label key={field.column} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      {field.label}
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                        value={tableFilters[field.column] ?? ''}
                        onChange={(event) => setTableFilters((current) => ({ ...current, [field.column]: event.target.value }))}
                        placeholder={`Search ${field.label.toLowerCase()}`}
                      />
                    </label>
                  ),
                )}
                {hasStatusFilter ? (
                  <AdminSelect
                    label="Status"
                    value={tableFilters.status || 'all'}
                    options={[
                      { label: 'All', value: 'all' },
                      { label: 'Published', value: 'published' },
                      { label: 'Draft', value: 'draft' },
                    ]}
                    onChange={(nextValue) => setTableFilters((current) => ({ ...current, status: nextValue }))}
                  />
                ) : null}
              </div>
            ) : null}
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                <tr>
                  {showsThumbnail ? <th className="px-4 py-3 font-semibold">Preview</th> : null}
                  {visibleFields.map((field) => (
                    <th key={field.column} className="px-4 py-3 font-semibold">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.map((record) => (
                  <tr key={String(record.id)} className="align-top">
                    {showsThumbnail ? (
                      <td className="px-4 py-3">
                        <RecordPreviewCell config={config} record={record} onPreview={setPreviewOverlay} />
                      </td>
                    ) : null}
                    {visibleFields.map((field) => (
                      <td key={field.column} className="max-w-xs px-4 py-3 text-slate-700 dark:text-slate-200">
                        <span className="line-clamp-3">{field.kind === 'date' ? formatAdminDate(record[field.column] as AdminRecordValue | undefined) : displayValue(record[field.column] as AdminRecordValue | undefined)}</span>
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <StatusBadge isPublished={Boolean(record.is_published)} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatAdminDate(record.updated_at)}</td>
                    <td className="px-4 py-3">
                      <AdminMenu
                        label="Record actions"
                        items={[
                          { label: 'Edit', onSelect: () => setEditingRecord(record) },
                          { label: 'Duplicate', onSelect: () => duplicateRecord(record) },
                          { label: record.is_published ? 'Unpublish' : 'Publish', onSelect: () => togglePublishMutation.mutate(record) },
                          ...(canDelete
                            ? [
                                {
                                  label: 'Delete',
                                  tone: 'danger' as const,
                                  onSelect: () => {
                                    if (window.confirm('Delete this record?')) deleteMutation.mutate(record);
                                  },
                                },
                              ]
                            : []),
                        ]}
                      >
                        <MoreIcon />
                      </AdminMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRecords.length === 0 ? <p className="p-6 text-sm text-slate-500 dark:text-slate-400">{records.length === 0 ? 'No records yet.' : 'No records match the current filters.'}</p> : null}
            </div>
          </div>
        ) : null}
      </div>
      {previewOverlay ? <ImagePreviewOverlay src={previewOverlay.src} title={previewOverlay.title} onClose={() => setPreviewOverlay(null)} /> : null}
    </section>
  );
}
