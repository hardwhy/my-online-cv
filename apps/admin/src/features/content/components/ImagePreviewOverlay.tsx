import { useEffect } from 'react';

function CloseIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 6 14 14M14 6 6 14" strokeLinecap="round" />
    </svg>
  );
}

export function ImagePreviewOverlay({
  src,
  title,
  onClose,
}: {
  src: string;
  title: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm dark:bg-slate-950/80"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button className="absolute inset-0 cursor-default" type="button" onClick={onClose} aria-label="Close preview" />
      <div className="relative max-h-full w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-950 dark:text-white">{title}</p>
          <button
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            type="button"
            onClick={onClose}
            aria-label="Close preview"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="max-h-[78vh] overflow-auto bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%3E%3Crect%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23f1f5f9%22%2F%3E%3Crect%20x%3D%228%22%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23f1f5f9%22%2F%3E%3Crect%20x%3D%228%22%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23e2e8f0%22%2F%3E%3Crect%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23e2e8f0%22%2F%3E%3C%2Fsvg%3E')] p-4 dark:bg-slate-950">
          <img className="mx-auto max-h-[72vh] rounded-2xl object-contain" src={src} alt={title} />
        </div>
      </div>
    </div>
  );
}
