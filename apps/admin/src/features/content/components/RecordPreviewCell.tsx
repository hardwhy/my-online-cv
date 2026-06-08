import { useState } from 'react';
import type { AdminRecord, AdminTableConfig, StorageUploadTarget } from '@web-cv-services/shared-types';
import { storageUploadTargets } from '@web-cv-services/shared-services';
import { getPublicAssetUrl } from './assetUrls';
import { getProjectFallbackImage, isProjectTerminalFallback } from '../utils';

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

const getStorageTarget = (kind: StorageUploadTarget['kind']) =>
  storageUploadTargets.find((t) => t.kind === kind);

const getRecordThumbnailUrl = (config: AdminTableConfig, record: AdminRecord, cacheBuster?: number): string | undefined => {
  if (config.name === 'projects') {
    const target = getStorageTarget('project-thumbnail');
    const base = target ? getPublicAssetUrl(target, String(record.slug ?? '')) : undefined;
    if (!base) return undefined;
    return cacheBuster ? `${base}${base.includes('?') ? '&' : '?'}v=${cacheBuster}` : base;
  }
  if (config.name === 'certifications') {
    return typeof record.image_url === 'string' ? record.image_url : undefined;
  }
  return undefined;
};

export function RecordPreviewCell({
  config,
  record,
  cacheBuster,
  onPreview,
}: {
  config: AdminTableConfig;
  record: AdminRecord;
  cacheBuster?: number;
  onPreview: (preview: { src: string; title: string }) => void;
}) {
  const [failedThumbnailUrl, setFailedThumbnailUrl] = useState<string | null>(null);
  const thumbnailUrl = getRecordThumbnailUrl(config, record, cacheBuster);
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
        <img
          className="h-full w-full object-cover"
          src={displayUrl}
          alt=""
          onError={() => thumbnailUrl && setFailedThumbnailUrl(thumbnailUrl)}
        />
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
