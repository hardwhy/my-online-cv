import { useEffect, useMemo } from 'react';
import { downloadBlob } from './pdf-utils';

type PdfPreviewDialogProps = {
  blob: Blob | null;
  error: string | null;
  isLoading: boolean;
  title: string;
  emptySubtitle: string;
  fileName: string;
  loadingMessage?: string;
  downloadEventName?: string;
  onClose: () => void;
  onRetry: () => void;
};

export function PdfPreviewDialog({
  blob,
  error,
  isLoading,
  title,
  emptySubtitle,
  fileName,
  loadingMessage = 'Generating PDF...',
  downloadEventName,
  onClose,
  onRetry,
}: PdfPreviewDialogProps) {
  const previewUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const downloadPdf = () => {
    if (!blob) return;
    downloadBlob(blob, { fileName });
    if (downloadEventName) window.dispatchEvent(new CustomEvent(downloadEventName));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-950 dark:text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{emptySubtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
              type="button"
              disabled={isLoading}
              onClick={onRetry}
            >
              Regenerate
            </button>
            <button
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50 dark:bg-brand-300 dark:text-slate-950"
              type="button"
              disabled={!blob || isLoading}
              onClick={downloadPdf}
            >
              Download
            </button>
            <button
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-200"
              type="button"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 bg-slate-100 p-4 dark:bg-slate-950">
          {isLoading ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {loadingMessage}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100">
              {error}
            </div>
          ) : previewUrl ? (
            <iframe className="h-full w-full rounded-2xl border border-slate-200 bg-white dark:border-slate-700" src={previewUrl} title={title} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              No PDF generated yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
