import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  adminTableConfigs,
  createAdminRecord,
  deleteAdminRecord,
  listAdminRecords,
  updateAdminRecord,
} from '@web-cv-services/shared-services';
import type { AdminFieldConfig, AdminRecord, AdminRecordValue } from '@web-cv-services/shared-types';
import { AdminMenu, AdminSelect, MoreIcon } from '../../components/AdminDropdown';
import { menuItemClasses, menuPanelClasses } from '../../components/adminDropdownStyles';
import { adminSupabase } from '../../lib/supabase';
import { createDuplicateRecordPayload, displayValue, formatAdminDate } from './utils';
import { RecordForm } from './components/RecordForm';
import { RecordPreviewCell } from './components/RecordPreviewCell';
import { TableShimmer } from './components/TableShimmer';
import { ImagePreviewOverlay } from './components/ImagePreviewOverlay';

// ─── Filter config ────────────────────────────────────────────────────────────

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

// ─── Context menu ─────────────────────────────────────────────────────────────

type ContextMenuState = {
  x: number;
  y: number;
  record: AdminRecord;
};

function RowContextMenu({
  state,
  items,
  onClose,
}: {
  state: ContextMenuState;
  items: { label: string; onSelect: () => void; tone?: 'default' | 'danger' }[];
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Clamp position so menu stays inside viewport
  const [pos, setPos] = useState({ top: state.y, left: state.x });
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setPos({
      top: Math.min(state.y, window.innerHeight - height - 8),
      left: Math.min(state.x, window.innerWidth - width - 8),
    });
  }, [state.x, state.y]);

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) onClose();
    };
    const closeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', closeKey);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', closeKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      className={`${menuPanelClasses} fixed w-44`}
      style={{ top: pos.top, left: pos.left }}
      role="menu"
    >
      {items.map((item, index) => (
        <button
          key={item.label}
          className={`${menuItemClasses} ${
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
          onClick={() => {
            item.onSelect();
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
        isPublished
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
      }`}
    >
      {isPublished ? 'Published' : 'Draft'}
    </span>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ContentAdmin() {
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tableNameFromUrl = searchParams.get('type') as (typeof adminTableConfigs)[number]['name'] | null;
  const validTableName =
    adminTableConfigs.find((t) => t.name === tableNameFromUrl)?.name ?? adminTableConfigs[0].name;

  const [tableName, setTableName] = useState(validTableName);
  const [editingRecord, setEditingRecord] = useState<AdminRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [tableFilters, setTableFilters] = useState<Record<string, string>>({});
  const [previewOverlay, setPreviewOverlay] = useState<{ src: string; title: string } | null>(null);
  // Per-record cache busters updated after a successful save to refresh thumbnails
  const [thumbnailBusters, setThumbnailBusters] = useState<Record<string, number>>({});
  // Right-click context menu
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // When the form is open and dirty, we need to intercept actions that close it.
  // RecordForm owns the unsaved-changes modal; we pass actions through it via
  // the onRequestAction callback (see RecordForm implementation).
  const [pendingFormAction, setPendingFormAction] = useState<(() => void) | null>(null);
  const formIsDirtyRef = useRef(false);

  const config = useMemo(
    () => adminTableConfigs.find((t) => t.name === tableName) ?? adminTableConfigs[0],
    [tableName],
  );
  const queryKey = ['admin-content', config.name];

  /** If the form is open and dirty, ask it to confirm; otherwise run immediately */
  const guardFormAction = (action: () => void) => {
    if ((isCreating || editingRecord) && formIsDirtyRef.current) {
      setPendingFormAction(() => action);
    } else {
      action();
    }
  };

  const setContentType = (nextType: string) => {
    guardFormAction(() => {
      setTableName(nextType as typeof tableName);
      setEditingRecord(null);
      setIsCreating(false);
      setTableFilters({});
      setSearchParams({ type: nextType }, { replace: true });
    });
  };

  const recordsQuery = useQuery({
    queryKey,
    queryFn: () => listAdminRecords(adminSupabase, config),
  });
  const records = recordsQuery.data ?? [];
  const publishedProfileRecords =
    config.name === 'site_profile' ? records.filter((r) => Boolean(r.is_published)) : [];

  const draftOtherProfiles = async (publishedRecordId: string) => {
    await Promise.all(
      records
        .filter((r) => String(r.id) !== publishedRecordId && Boolean(r.is_published))
        .map((r) => updateAdminRecord(adminSupabase, 'site_profile', String(r.id), { is_published: false })),
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
      const hasOtherPublished = publishedProfileRecords.some((p) => String(p.id) !== currentRecordId);

      if (!nextIsPublished && !hasOtherPublished) {
        throw new Error('At least one profile record must stay published.');
      }

      const saved = currentRecordId
        ? await updateAdminRecord(adminSupabase, config.name, currentRecordId, record)
        : await createAdminRecord(adminSupabase, config.name, record);

      if (nextIsPublished && saved.id) await draftOtherProfiles(String(saved.id));
      return saved;
    },
    onSuccess: async () => {
      // Bust thumbnail for the saved record
      const recordId = String(editingRecord?.id ?? 'new');
      setThumbnailBusters((prev) => ({ ...prev, [recordId]: Math.floor(Date.now() / 1000) }));
      setEditingRecord(null);
      setIsCreating(false);
      formIsDirtyRef.current = false;
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
    onError: (err) => window.alert(err instanceof Error ? err.message : 'Unable to delete record.'),
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
      const updated = await updateAdminRecord(adminSupabase, config.name, String(record.id), {
        is_published: !record.is_published,
      });
      if (!record.is_published) await draftOtherProfiles(String(record.id));
      return updated;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (err) => window.alert(err instanceof Error ? err.message : 'Unable to update publish status.'),
  });

  const visibleFields = config.fields.filter((f) => f.column !== 'is_published').slice(0, 4);
  const canDelete = config.name === 'site_profile' || config.supportsDelete !== false;
  const showsThumbnail = config.name === 'projects' || config.name === 'certifications';
  const configuredFilterColumns = tableFilterColumns[config.name] ?? [];
  const filterableFields = configuredFilterColumns
    .filter((col) => col !== 'status')
    .map((col) => config.fields.find((f) => f.column === col))
    .filter((f): f is AdminFieldConfig => Boolean(f));
  const hasStatusFilter = configuredFilterColumns.includes('status');

  const filteredRecords = records.filter((record) => {
    const matchesFields = filterableFields.every((field) => {
      const filterValue = tableFilters[field.column]?.trim().toLowerCase();
      if (!filterValue) return true;
      return displayValue(record[field.column] as AdminRecordValue | undefined)
        .toLowerCase()
        .includes(filterValue);
    });
    const statusFilter = hasStatusFilter ? tableFilters.status : '';
    const matchesStatus =
      !statusFilter ||
      statusFilter === 'all' ||
      (statusFilter === 'published' ? Boolean(record.is_published) : !record.is_published);
    return matchesFields && matchesStatus;
  });

  const duplicateRecord = (record: AdminRecord) => {
    guardFormAction(() => {
      setEditingRecord(createDuplicateRecordPayload(config, record, records));
      setIsCreating(true);
    });
  };

  const startEdit = (record: AdminRecord) => {
    guardFormAction(() => setEditingRecord(record));
  };

  useEffect(() => {
    if (!isCreating && !editingRecord) return;
    window.requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  }, [editingRecord, isCreating]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">
              Content
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-slate-950 dark:text-white">Portfolio CMS</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{config.description}</p>
          </div>
          <button
            className="btn-primary"
            type="button"
            onClick={() =>
              guardFormAction(() => {
                setEditingRecord(null);
                setIsCreating(true);
              })
            }
          >
            New {config.label}
          </button>
        </div>

        <AdminSelect
          className="mt-6 max-w-sm"
          label="Content type"
          value={config.name}
          options={adminTableConfigs.map((t) => ({ label: t.label, value: t.name, description: t.description }))}
          onChange={(nextValue) => setContentType(nextValue)}
        />
      </div>

      {/* Form */}
      {isCreating || editingRecord ? (
        <div ref={formRef} className="scroll-mt-24">
          <RecordForm
            key={`${config.name}-${editingRecord?.id ?? (editingRecord ? JSON.stringify(editingRecord) : 'new')}`}
            config={config}
            record={editingRecord}
            pendingExternalAction={pendingFormAction}
            onDirtyChange={(dirty) => { formIsDirtyRef.current = dirty; }}
            onExternalActionConsumed={() => setPendingFormAction(null)}
            onCancel={() => {
              setEditingRecord(null);
              setIsCreating(false);
              formIsDirtyRef.current = false;
            }}
            onSubmit={async (record) => {
              await saveMutation.mutateAsync(record);
            }}
          />
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {recordsQuery.isLoading ? (
          <TableShimmer showsThumbnail={showsThumbnail} columnCount={visibleFields.length} />
        ) : null}
        {recordsQuery.error ? (
          <p className="p-6 text-sm text-red-600 dark:text-red-300">{recordsQuery.error.message}</p>
        ) : null}
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
                      options={[
                        { label: 'All', value: 'all' },
                        ...(field.options ?? []).map((o) => ({ label: o, value: o })),
                      ]}
                      onChange={(nextValue) =>
                        setTableFilters((current) => ({
                          ...current,
                          [field.column]: nextValue === 'all' ? '' : nextValue,
                        }))
                      }
                    />
                  ) : (
                    <label key={field.column} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      {field.label}
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                        value={tableFilters[field.column] ?? ''}
                        onChange={(event) =>
                          setTableFilters((current) => ({ ...current, [field.column]: event.target.value }))
                        }
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
                    onChange={(nextValue) =>
                      setTableFilters((current) => ({ ...current, status: nextValue }))
                    }
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
                    <tr
                      key={String(record.id)}
                      className="cursor-pointer align-top transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      onClick={() => startEdit(record)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY, record });
                      }}
                    >
                      {showsThumbnail ? (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <RecordPreviewCell
                            config={config}
                            record={record}
                            cacheBuster={thumbnailBusters[String(record.id)]}
                            onPreview={setPreviewOverlay}
                          />
                        </td>
                      ) : null}
                      {visibleFields.map((field) => (
                        <td
                          key={field.column}
                          className="max-w-xs px-4 py-3 text-slate-700 dark:text-slate-200"
                        >
                          <span className="line-clamp-3">
                            {field.kind === 'date'
                              ? formatAdminDate(record[field.column] as AdminRecordValue | undefined)
                              : displayValue(record[field.column] as AdminRecordValue | undefined)}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <StatusBadge isPublished={Boolean(record.is_published)} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {formatAdminDate(record.updated_at)}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()} onContextMenu={(e) => e.stopPropagation()}>
                        <AdminMenu
                          label="Record actions"
                          items={[
                            { label: 'Edit', onSelect: () => startEdit(record) },
                            { label: 'Duplicate', onSelect: () => duplicateRecord(record) },
                            {
                              label: record.is_published ? 'Unpublish' : 'Publish',
                              onSelect: () =>
                                guardFormAction(() => togglePublishMutation.mutate(record)),
                            },
                            ...(canDelete
                              ? [
                                  {
                                    label: 'Delete',
                                    tone: 'danger' as const,
                                    onSelect: () =>
                                      guardFormAction(() => {
                                        if (window.confirm('Delete this record?'))
                                          deleteMutation.mutate(record);
                                      }),
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
              {filteredRecords.length === 0 ? (
                <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
                  {records.length === 0 ? 'No records yet.' : 'No records match the current filters.'}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {previewOverlay ? (
        <ImagePreviewOverlay
          src={previewOverlay.src}
          title={previewOverlay.title}
          onClose={() => setPreviewOverlay(null)}
        />
      ) : null}

      {contextMenu ? (
        <RowContextMenu
          state={contextMenu}
          onClose={() => setContextMenu(null)}
          items={[
            { label: 'Edit', onSelect: () => startEdit(contextMenu.record) },
            { label: 'Duplicate', onSelect: () => duplicateRecord(contextMenu.record) },
            {
              label: contextMenu.record.is_published ? 'Unpublish' : 'Publish',
              onSelect: () => guardFormAction(() => togglePublishMutation.mutate(contextMenu.record)),
            },
            ...(canDelete
              ? [
                  {
                    label: 'Delete',
                    tone: 'danger' as const,
                    onSelect: () =>
                      guardFormAction(() => {
                        if (window.confirm('Delete this record?')) deleteMutation.mutate(contextMenu.record);
                      }),
                  },
                ]
              : []),
          ]}
        />
      ) : null}
    </section>
  );
}
