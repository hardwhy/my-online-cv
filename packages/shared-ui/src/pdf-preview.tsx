import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function RefreshIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M15.5 10a5.5 5.5 0 1 1-1.37-3.63M15.5 3v4h-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloudArrowUpIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M13 10.5l-3-3-3 3M10 7.5v6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 12.5a4 4 0 0 1 .5-7.97 3.5 3.5 0 1 1 6.8 0A4.5 4.5 0 1 1 11 15.5H6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M16.25 5.5l-8.75 9-4.25-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XMarkIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M15 5L5 15M5 5l10 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type PdfPreviewDialogProps = {
  blob: Blob | null;
  error: string | null;
  isLoading: boolean;
  isUploading?: boolean;
  uploadStatus?: 'idle' | 'success' | 'error';
  title: string;
  emptySubtitle: string;
  loadingMessage?: string;
  onClose: () => void;
  onRetry: () => void;
  onUpload?: () => void;
};

export function PdfPreviewDialog({
  blob,
  error,
  isLoading,
  isUploading,
  uploadStatus,
  title,
  emptySubtitle,
  loadingMessage = 'Generating PDF...',
  onClose,
  onRetry,
  onUpload,
}: PdfPreviewDialogProps) {
  const previewUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
              className="btn-icon-secondary"
              type="button"
              disabled={isLoading}
              onClick={onRetry}
              title="Regenerate"
            >
              <RefreshIcon />
            </button>
            {onUpload && (
              <button
                className={`btn-icon-secondary ${
                  uploadStatus === 'success'
                    ? '!border-emerald-300 !text-emerald-600 dark:!border-emerald-700 dark:!text-emerald-400'
                    : ''
                }`}
                type="button"
                disabled={isUploading || isLoading || !blob}
                onClick={onUpload}
                title={uploadStatus === 'success' ? 'Uploaded' : 'Upload to Storage'}
              >
                <AnimatePresence mode="wait">
                  {isUploading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"
                    />
                  ) : uploadStatus === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <CheckIcon />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <CloudArrowUpIcon />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            )}
            <button
              className="btn-icon-danger"
              type="button"
              onClick={onClose}
              title="Close"
            >
              <XMarkIcon />
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
