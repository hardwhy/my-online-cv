import { useCallback, useEffect, useState } from 'react';
import { PdfPreviewDialog } from '@web-cv/shared-ui';
import { cvPdfFileName, fetchCvPdf } from './pdfApi';

type DownloadCvButtonProps = {
  className?: string;
};

export function DownloadCvButton({ className = 'btn-primary' }: DownloadCvButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generatePdf = useCallback(async (refresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const nextBlob = await fetchCvPdf({ visibility: 'public', refresh });
      setBlob(nextBlob);
    } catch (pdfError) {
      setError(pdfError instanceof Error ? pdfError.message : 'Unable to generate CV PDF.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openPreview = () => {
    setIsOpen(true);
    if (!blob) void generatePdf();
  };

  useEffect(() => {
    if (!isOpen) return;
    const closeOnRouteChange = () => setIsOpen(false);
    window.addEventListener('hashchange', closeOnRouteChange);
    return () => window.removeEventListener('hashchange', closeOnRouteChange);
  }, [isOpen]);

  return (
    <>
      <button className={className} type="button" onClick={openPreview}>
        Download CV
      </button>
      {isOpen ? (
        <PdfPreviewDialog
          blob={blob}
          error={error}
          isLoading={isLoading}
          title="CV PDF Preview"
          emptySubtitle="Generated from latest published content"
          fileName={cvPdfFileName}
          downloadEventName="portfolio:cv-download"
          loadingMessage="Generating latest CV PDF..."
          onClose={() => setIsOpen(false)}
          onRetry={() => void generatePdf(true)}
        />
      ) : null}
    </>
  );
}
