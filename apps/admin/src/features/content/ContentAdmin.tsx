import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminTableConfigs,
  createAdminRecord,
  deleteAdminRecord,
  listAdminRecords,
  updateAdminRecord,
} from '@portfolio/shared-services';
import type { AdminFieldConfig, AdminRecord, AdminRecordValue, AdminTableConfig } from '@portfolio/shared-types';
import { AdminMenu, AdminSelect, MoreIcon } from '../../components/AdminDropdown';
import { adminSupabase } from '../../lib/supabase';

type FormState = Record<string, string | boolean | string[]>;

const editableFields = (config: AdminTableConfig) => config.fields.filter((field) => !field.readOnly);

const stringifyFieldValue = (field: AdminFieldConfig, value: AdminRecordValue | undefined): string | boolean | string[] => {
  if (field.kind === 'boolean') return Boolean(value ?? field.defaultValue ?? false);
  if (field.kind === 'array') return Array.isArray(value) ? value.map(String) : [];
  if (field.kind === 'json') return JSON.stringify(value ?? field.defaultValue ?? [], null, 2);
  if (field.kind === 'number') return String(value ?? field.defaultValue ?? 0);
  return String(value ?? field.defaultValue ?? '');
};

const createInitialFormState = (config: AdminTableConfig, record?: AdminRecord | null): FormState =>
  editableFields(config).reduce<FormState>((state, field) => {
    state[field.column] = stringifyFieldValue(field, record?.[field.column] as AdminRecordValue | undefined);
    return state;
  }, {});

const parseFieldValue = (field: AdminFieldConfig, value: string | boolean | string[]): AdminRecordValue => {
  if (field.kind === 'boolean') return Boolean(value);
  if (field.kind === 'number') return Number(value);
  if (field.kind === 'array') {
    if (Array.isArray(value)) {
      return value.map((item) => item.trim()).filter(Boolean);
    }

    return String(value)
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (field.kind === 'json') {
    const rawValue = String(value).trim();
    return rawValue ? (JSON.parse(rawValue) as AdminRecordValue) : [];
  }
  return String(value).trim() || null;
};

const asArrayValue = (value: string | boolean | string[] | undefined) => (Array.isArray(value) ? value : []);

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
                  className="text-slate-400 transition hover:text-red-500"
                  type="button"
                  onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                  aria-label={`Remove ${item}`}
                >
                  x
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

const displayValue = (value: AdminRecordValue | undefined) => {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value && typeof value === 'object') return JSON.stringify(value);
  return value === null || value === undefined || value === '' ? '-' : String(value);
};

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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = editableFields(config).reduce<AdminRecord>((nextRecord, field) => {
        nextRecord[field.column] = parseFieldValue(field, formState[field.column]);
        return nextRecord;
      }, {});
      await onSubmit(payload);
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
          <h2 className="font-display text-xl font-bold text-slate-950 dark:text-white">{record ? 'Edit record' : 'Create record'}</h2>
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

      {error ? <p className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100">{error}</p> : null}

      <button className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60 dark:bg-brand-300 dark:text-slate-950" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save record'}
      </button>
    </form>
  );
}

export function ContentAdmin() {
  const queryClient = useQueryClient();
  const [tableName, setTableName] = useState(adminTableConfigs[0].name);
  const [editingRecord, setEditingRecord] = useState<AdminRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const config = useMemo(() => adminTableConfigs.find((table) => table.name === tableName) ?? adminTableConfigs[0], [tableName]);
  const queryKey = ['admin-content', config.name];

  const recordsQuery = useQuery({
    queryKey,
    queryFn: () => listAdminRecords(adminSupabase, config),
  });

  const saveMutation = useMutation({
    mutationFn: (record: AdminRecord) => {
      if (editingRecord?.id) return updateAdminRecord(adminSupabase, config.name, editingRecord.id, record);
      return createAdminRecord(adminSupabase, config.name, record);
    },
    onSuccess: async () => {
      setEditingRecord(null);
      setIsCreating(false);
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (record: AdminRecord) => deleteAdminRecord(adminSupabase, config.name, String(record.id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const togglePublishMutation = useMutation({
    mutationFn: (record: AdminRecord) =>
      updateAdminRecord(adminSupabase, config.name, String(record.id), {
        is_published: !record.is_published,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const visibleFields = config.fields.slice(0, 4);
  const records = recordsQuery.data ?? [];
  const canDelete = config.supportsDelete !== false;

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
          }}
        />
      </div>

      {isCreating || editingRecord ? (
        <RecordForm
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
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {recordsQuery.isLoading ? <p className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading records...</p> : null}
        {recordsQuery.error ? <p className="p-6 text-sm text-red-600 dark:text-red-300">{recordsQuery.error.message}</p> : null}
        {!recordsQuery.isLoading && !recordsQuery.error ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                <tr>
                  {visibleFields.map((field) => (
                    <th key={field.column} className="px-4 py-3 font-semibold">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold">Published</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((record) => (
                  <tr key={String(record.id)} className="align-top">
                    {visibleFields.map((field) => (
                      <td key={field.column} className="max-w-xs px-4 py-3 text-slate-700 dark:text-slate-200">
                        <span className="line-clamp-3">{displayValue(record[field.column] as AdminRecordValue | undefined)}</span>
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${record.is_published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {record.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{record.updated_at ? new Date(String(record.updated_at)).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3">
                      <AdminMenu
                        label="Record actions"
                        items={[
                          { label: 'Edit', onSelect: () => setEditingRecord(record) },
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
            {records.length === 0 ? <p className="p-6 text-sm text-slate-500 dark:text-slate-400">No records yet.</p> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
