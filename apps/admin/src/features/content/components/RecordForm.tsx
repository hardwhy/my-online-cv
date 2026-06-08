import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminRecord, AdminTableConfig, StorageTargetKind, StorageUploadTarget } from '@web-cv-services/shared-types';
import { removePortfolioAsset, storageUploadTargets, uploadPortfolioAsset } from '@web-cv-services/shared-services';
import { AdminSelect } from '../../../components/AdminDropdown';
import { adminSupabase } from '../../../lib/supabase';
import type { FormState, PendingAssetChange } from '../types';
import {
  asArrayValue,
  asStructuredItems,
  createInitialFormState,
  editableFields,
  parseFieldValue,
  slugify,
} from '../utils';
import { ArrayField } from './ArrayField';
import { AssetField } from './AssetField';
import { ImagePreviewOverlay } from './ImagePreviewOverlay';
import { StructuredListField } from './StructuredListField';

const getStorageTarget = (kind: StorageTargetKind): StorageUploadTarget | undefined =>
  storageUploadTargets.find((t) => t.kind === kind);

function ConfirmModal({
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <p className="font-semibold text-slate-950 dark:text-white">Unsaved changes</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-secondary" type="button" onClick={onCancel}>
            Keep editing
          </button>
          <button className="btn-danger" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RecordForm({
  config,
  record,
  pendingExternalAction,
  onDirtyChange,
  onExternalActionConsumed,
  onCancel,
  onSubmit,
}: {
  config: AdminTableConfig;
  record: AdminRecord | null;
  /** An action triggered externally (e.g. clicking a different row) that should be guarded */
  pendingExternalAction?: (() => void) | null;
  /** Notifies parent of current dirty state */
  onDirtyChange?: (dirty: boolean) => void;
  /** Called after pendingExternalAction is handled (accepted or rejected) */
  onExternalActionConsumed?: () => void;
  onCancel: () => void;
  onSubmit: (record: AdminRecord) => Promise<void>;
}) {
  const [formState, setFormState] = useState<FormState>(() => createInitialFormState(config, record));
  const [assetChanges, setAssetChanges] = useState<Partial<Record<StorageTargetKind, PendingAssetChange>>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const initialFormState = useMemo(() => createInitialFormState(config, record), [config, record]);

  const isDirty = useMemo(() => {
    if (Object.keys(assetChanges).length > 0) return true;
    return Object.keys(formState).some((key) => {
      const current = formState[key];
      const initial = initialFormState[key];
      if (Array.isArray(current) && Array.isArray(initial))
        return JSON.stringify(current) !== JSON.stringify(initial);
      return current !== initial;
    });
  }, [formState, initialFormState, assetChanges]);

  // Notify parent when dirty state changes
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // When parent passes an external action (e.g. row click), show confirm if dirty
  useEffect(() => {
    if (!pendingExternalAction) return;
    if (isDirty) {
      setPendingAction(() => pendingExternalAction);
      setShowCancelConfirm(true);
    } else {
      pendingExternalAction();
      onExternalActionConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingExternalAction]);

  const projectSlug = typeof formState.slug === 'string' ? formState.slug : '';
  const certificateSlug = slugify(
    [formState.name, formState.issuer].filter((item) => typeof item === 'string' && item).join('-'),
  );

  const setPendingAssetChange = (kind: StorageTargetKind, change: PendingAssetChange | null) => {
    setAssetChanges((current) => {
      const next = { ...current };
      if (change) {
        next[kind] = change;
      } else {
        delete next[kind];
      }
      return next;
    });
  };

  const getAssetSlug = (target: StorageUploadTarget, payload: AdminRecord): string | undefined => {
    if (target.kind === 'project-thumbnail' || target.kind === 'social-icon')
      return typeof payload.slug === 'string' ? payload.slug : '';
    if (target.kind === 'certificate-file' || target.kind === 'certificate-preview') {
      return slugify(
        [payload.name, payload.issuer].filter((item) => typeof item === 'string' && item).join('-'),
      );
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
    if (!isDirty) return;

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

  /** Intercept any action that navigates away; show confirmation if dirty */
  const guardedAction = useCallback(
    (action: () => void) => {
      if (!isDirty) {
        action();
        return;
      }
      setPendingAction(() => action);
      setShowCancelConfirm(true);
    },
    [isDirty],
  );

  /** Expose guardedAction so parent can intercept table clicks etc */
  // (parent passes down a callback ref pattern via onCancel wrapper)
  const handleCancel = () => guardedAction(onCancel);

  const commonClasses =
    'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-950 outline-none transition focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white';

  const showsAssets =
    config.name === 'site_profile' ||
    config.name === 'projects' ||
    config.name === 'certifications' ||
    config.name === 'social_links';

  return (
    <>
      <form
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-950 dark:text-white">
              {record?.id ? 'Edit record' : 'Create record'}
              {isDirty && (
                <span
                  className="inline-block h-2 w-2 rounded-full bg-amber-400"
                  title="Unsaved changes"
                  aria-label="Unsaved changes"
                />
              )}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{config.label}</p>
          </div>
          <button className="btn-secondary" type="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {editableFields(config).map((field) => {
            const value = formState[field.column];

            if (field.kind === 'boolean') {
              return (
                <label
                  key={field.column}
                  className="flex h-10 items-center gap-3 self-end text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  <input
                    className="h-4 w-4 rounded border-slate-300 accent-slate-950 dark:border-slate-700 dark:accent-white"
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, [field.column]: event.target.checked }))
                    }
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
                  onChange={(nextValue) =>
                    setFormState((current) => ({ ...current, [field.column]: nextValue }))
                  }
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
                  onChange={(nextValue) =>
                    setFormState((current) => ({ ...current, [field.column]: nextValue }))
                  }
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
                  onChange={(nextValue) =>
                    setFormState((current) => ({ ...current, [field.column]: nextValue }))
                  }
                />
              );
            }

            const isLarge = field.kind === 'textarea' || field.kind === 'json';
            return (
              <label
                key={field.column}
                className={
                  isLarge
                    ? 'block text-sm font-medium text-slate-700 dark:text-slate-200 lg:col-span-2'
                    : 'block text-sm font-medium text-slate-700 dark:text-slate-200'
                }
              >
                {field.label}
                {isLarge ? (
                  <textarea
                    className={commonClasses}
                    rows={field.kind === 'json' ? 8 : 5}
                    value={String(value)}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, [field.column]: event.target.value }))
                    }
                    required={field.required}
                  />
                ) : (
                  <input
                    className={commonClasses}
                    type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : 'text'}
                    value={String(value)}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, [field.column]: event.target.value }))
                    }
                    required={field.required}
                  />
                )}
              </label>
            );
          })}
        </div>

        {showsAssets && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {config.name === 'site_profile' && getStorageTarget('profile') ? (
              <AssetField
                target={getStorageTarget('profile')!}
                pendingChange={assetChanges.profile}
                onPendingChange={(change) => setPendingAssetChange('profile', change)}
              />
            ) : null}
            {config.name === 'social_links' && getStorageTarget('social-icon') ? (
              <AssetField
                target={getStorageTarget('social-icon')!}
                slug={typeof formState.slug === 'string' ? formState.slug : ''}
                value={typeof formState.icon === 'string' ? formState.icon : undefined}
                pendingChange={assetChanges['social-icon']}
                onPendingChange={(change) => setPendingAssetChange('social-icon', change)}
              />
            ) : null}
            {config.name === 'projects' && getStorageTarget('project-thumbnail') ? (
              <AssetField
                target={getStorageTarget('project-thumbnail')!}
                slug={projectSlug}
                pendingChange={assetChanges['project-thumbnail']}
                onPendingChange={(change) => setPendingAssetChange('project-thumbnail', change)}
              />
            ) : null}
            {config.name === 'certifications' && getStorageTarget('certificate-file') ? (
              <AssetField
                target={getStorageTarget('certificate-file')!}
                slug={certificateSlug}
                value={typeof formState.download_url === 'string' ? formState.download_url : undefined}
                pendingChange={assetChanges['certificate-file']}
                onPendingChange={(change) => setPendingAssetChange('certificate-file', change)}
              />
            ) : null}
            {config.name === 'certifications' && getStorageTarget('certificate-preview') ? (
              <AssetField
                target={getStorageTarget('certificate-preview')!}
                slug={certificateSlug}
                value={typeof formState.image_url === 'string' ? formState.image_url : undefined}
                pendingChange={assetChanges['certificate-preview']}
                onPendingChange={(change) => setPendingAssetChange('certificate-preview', change)}
              />
            ) : null}
          </div>
        )}

        {error ? (
          <p className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100">
            {error}
          </p>
        ) : null}

        <button className="mt-6 btn-primary" type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      {showCancelConfirm && (
        <ConfirmModal
          message="You have unsaved changes. If you leave now they will be lost."
          confirmLabel="Discard changes"
          onConfirm={() => {
            setShowCancelConfirm(false);
            pendingAction?.();
            setPendingAction(null);
            onExternalActionConsumed?.();
          }}
          onCancel={() => {
            setShowCancelConfirm(false);
            setPendingAction(null);
            onExternalActionConsumed?.();
          }}
        />
      )}
    </>
  );
}

// Re-export guardedAction factory so ContentAdmin can intercept row/menu actions
export type { FormState };
