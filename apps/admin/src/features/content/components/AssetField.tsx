import { useEffect, useMemo, useRef, useState } from 'react';
import type { StorageUploadTarget } from '@web-cv-services/shared-types';
import type { PendingAssetChange } from '../types';
import { ImagePreviewOverlay } from './ImagePreviewOverlay';
import { getPublicAssetUrl } from './assetUrls';

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

function UploadIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M10 13V4M6.5 7.5 10 4l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 14v1.5A1.5 1.5 0 0 0 4.5 17h11a1.5 1.5 0 0 0 1.5-1.5V14" strokeLinecap="round" />
    </svg>
  );
}

function ConfirmModal({
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmLabel?: string;
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
        <p className="font-semibold text-slate-950 dark:text-white">Remove asset</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-danger" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AssetField({
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
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [dailyCacheBuster] = useState(() => Math.floor(Date.now() / (1000 * 60 * 60 * 24)));
  // Use a ref-based approach: cacheBuster starts at 0 (meaning "use current time"),
  // then gets bumped to a fresh timestamp after each successful upload.
  const [cacheBuster, setCacheBuster] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const file = pendingChange?.file ?? null;
  const isImage = target.accept.startsWith('image/');
  // `value` is a DB-stored URL (confirmed to exist). `getPublicAssetUrl` is derived
  // from the path template — Supabase always generates a URL regardless of whether
  // the file actually exists in storage. So we only trust it as "existing" when:
  //  - there is an explicit `value` prop (DB-confirmed), OR
  //  - the image loaded without error (confirmed by the browser)
  const derivedUrl = getPublicAssetUrl(target, slug);
  const publicUrl = value || derivedUrl;
  // A file "exists" if: we have a DB-confirmed value, or the image loaded successfully
  // (imageLoadedOk tracks whether the <img> fired onLoad without onError)
  const [imageLoadedOk, setImageLoadedOk] = useState(false);
  const assetConfirmed = Boolean(value) || imageLoadedOk;
  const hasExistingAsset = assetConfirmed && !pendingChange?.remove;

  // Cache-busted URL: on initial render (cacheBuster === 0) we use a daily token
  // so repeated opens of the edit form always show the latest image without a stale
  // cached version. After a successful save the buster is set to a fresh second-precision
  // timestamp which forces an immediate reload.
  const effectiveBuster = cacheBuster === 0 ? dailyCacheBuster : cacheBuster;
  const previewUrl = publicUrl ? `${publicUrl}${publicUrl.includes('?') ? '&' : '?'}v=${effectiveBuster}` : undefined;

  const selectedPreviewUrl = useMemo(
    () => (file && isImage ? URL.createObjectURL(file) : null),
    [file, isImage],
  );
  const displayPreviewUrl = selectedPreviewUrl ?? (!pendingChange?.remove && !imageError ? previewUrl : undefined);

  // Bust cache when pendingChange clears after a save (file was uploaded or removed)
  const prevPendingRef = useRef(pendingChange);
  useEffect(() => {
    const prev = prevPendingRef.current;
    prevPendingRef.current = pendingChange;
    if (prev?.file && !pendingChange) {
      setCacheBuster(Math.floor(Date.now() / 1000));
      setImageError(false);
      // imageLoadedOk will update once the new <img> fires onLoad
    }
    if (prev?.remove && !pendingChange) {
      // After a remove was committed, the asset no longer exists
      setImageLoadedOk(false);
      setImageError(false);
    }
  }, [pendingChange]);

  useEffect(() => {
    if (!selectedPreviewUrl) return;
    return () => URL.revokeObjectURL(selectedPreviewUrl);
  }, [selectedPreviewUrl]);

  const queueRemove = () => {
    if (!hasExistingAsset) return;
    setShowRemoveConfirm(true);
  };

  const message = pendingChange?.file
    ? 'Asset upload will run when you save the record.'
    : pendingChange?.remove
      ? 'Asset removal will run when you save the record.'
      : null;

  const needsSlug = Boolean(target.requiresSlug && !slug);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{target.label}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{target.pathTemplate}</p>
        </div>
        {isImage ? (
          <button
            className="h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
            type="button"
            onClick={() => displayPreviewUrl && setPreviewOverlayUrl(displayPreviewUrl)}
            disabled={!displayPreviewUrl}
            aria-label={displayPreviewUrl ? `Preview ${target.label}` : undefined}
          >
            {displayPreviewUrl ? (
              <img
                className="h-full w-full object-contain"
                src={displayPreviewUrl}
                alt={target.label}
                onLoad={() => setImageLoadedOk(true)}
                onError={() => { setImageError(true); setImageLoadedOk(false); }}
              />
            ) : (
              <PlaceholderImage />
            )}
          </button>
        ) : null}
      </div>

      {/* File upload — styled as a button trigger */}
      <label className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 focus-within:ring-2 focus-within:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
        <UploadIcon />
        {pendingChange?.file ? pendingChange.file.name : 'Choose file…'}
        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          accept={target.accept}
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null;
            onPendingChange(nextFile ? { file: nextFile } : null);
            setImageError(false);
          }}
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="btn-danger"
          type="button"
          onClick={queueRemove}
          disabled={needsSlug || !hasExistingAsset}
          title={!hasExistingAsset ? 'No asset to remove' : undefined}
        >
          Remove
        </button>
        {pendingChange ? (
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              onPendingChange(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          >
            Clear pending
          </button>
        ) : null}
      </div>

      {needsSlug ? <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">Enter a slug before uploading.</p> : null}
      {message ? <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">{message}</p> : null}

      {previewOverlayUrl ? (
        <ImagePreviewOverlay src={previewOverlayUrl} title={target.label} onClose={() => setPreviewOverlayUrl(null)} />
      ) : null}

      {showRemoveConfirm ? (
        <ConfirmModal
          message={`This will queue removal of "${target.label}". The file will be deleted when you save the record.`}
          confirmLabel="Remove"
          onConfirm={() => {
            setShowRemoveConfirm(false);
            onPendingChange({ remove: true });
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          onCancel={() => setShowRemoveConfirm(false)}
        />
      ) : null}
    </div>
  );
}
