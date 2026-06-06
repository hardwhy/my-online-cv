import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CVDocument, cvPreviewCss, cvTemplateRegistry } from '@web-cv-services/cv-renderer';
import { getPortfolioCVData } from '@web-cv-services/shared-services';
import type { CVTemplateId } from '@web-cv-services/shared-types';
import { PdfPreviewDialog, downloadBlob, printBlob } from '@web-cv/shared-ui';
import { useAuth } from '../auth/authContext';
import { adminSupabase } from '../../lib/supabase';
import { cvPdfFileName, fetchAdminCvPdf } from './pdfApi';

export function ExportCvPage() {
  const { session } = useAuth();
  const [templateId, setTemplateId] = useState<CVTemplateId>('modern-ats');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);

  const cvQuery = useQuery({
    queryKey: ['admin-export', 'cv-data'],
    queryFn: () => getPortfolioCVData(adminSupabase, { visibility: 'admin' }),
  });

  const generatePdf = async (refresh = false) => {
    setIsGenerating(true);
    setError(null);

    try {
      const nextBlob = await fetchAdminCvPdf({
        authToken: session?.access_token,
        templateId,
        visibility: 'admin',
        refresh,
      });
      setBlob(nextBlob);
      setLastGeneratedAt(new Date().toLocaleString());
      return nextBlob;
    } catch (pdfError) {
      const message = pdfError instanceof Error ? pdfError.message : 'Unable to generate CV PDF.';
      setError(message);
      throw pdfError;
    } finally {
      setIsGenerating(false);
    }
  };

  const previewPdf = async () => {
    setIsPreviewOpen(true);
    if (!blob) {
      await generatePdf().catch(() => undefined);
    }
  };

  const downloadPdf = async () => {
    const pdfBlob = blob ?? (await generatePdf());
    downloadBlob(pdfBlob, { fileName: cvPdfFileName });
  };

  const printPdf = async () => {
    const pdfBlob = blob ?? (await generatePdf());
    printBlob(pdfBlob);
  };

  const regeneratePdf = async () => {
    await cvQuery.refetch();
    await generatePdf(true).catch(() => undefined);
  };

  const availableTemplates = cvTemplateRegistry.filter((template) => template.isAvailable);
  const unavailableTemplates = cvTemplateRegistry.filter((template) => !template.isAvailable);

  return (
    <section className="space-y-6">
      <style>{cvPreviewCss}</style>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">Export CV</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-950 dark:text-white">Professional PDF export</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Generate an ATS-friendly PDF from the latest saved portfolio content. Admin exports use authenticated access and can be regenerated after content changes.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-xl font-bold text-slate-950 dark:text-white">Template</h2>
            <div className="mt-4 grid gap-3">
              {availableTemplates.map((template) => (
                <label key={template.id} className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-500">
                  <input className="mt-1 h-4 w-4 accent-slate-950 dark:accent-brand-300" type="radio" checked={templateId === template.id} onChange={() => setTemplateId(template.id)} />
                  <span>
                    <span className="block text-sm font-bold text-slate-950 dark:text-white">{template.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{template.description}</span>
                  </span>
                </label>
              ))}
              {unavailableTemplates.map((template) => (
                <div key={template.id} className="rounded-2xl border border-dashed border-slate-200 p-4 opacity-70 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{template.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{template.description}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">Coming soon</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-xl font-bold text-slate-950 dark:text-white">Actions</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60 dark:bg-brand-300 dark:text-slate-950" type="button" disabled={isGenerating} onClick={() => void previewPdf()}>
                {isGenerating ? 'Generating...' : 'Preview PDF'}
              </button>
              <button className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200" type="button" disabled={isGenerating} onClick={() => void downloadPdf().catch(() => undefined)}>
                Download PDF
              </button>
              <button className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200" type="button" disabled={isGenerating} onClick={() => void printPdf().catch(() => undefined)}>
                Print PDF
              </button>
              <button className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200" type="button" disabled={isGenerating} onClick={() => void regeneratePdf()}>
                Regenerate PDF
              </button>
            </div>
            {lastGeneratedAt ? <p className="mt-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Last generated: {lastGeneratedAt}</p> : null}
            {error ? <p className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100">{error}</p> : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950 dark:text-white">Latest saved content</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">HTML preview of the same shared template used by PDF export.</p>
            </div>
            <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200" type="button" onClick={() => void cvQuery.refetch()}>
              Refresh data
            </button>
          </div>

          {cvQuery.isLoading ? <p className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">Loading CV data...</p> : null}
          {cvQuery.error ? <p className="mt-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100">{cvQuery.error.message}</p> : null}
          {cvQuery.data ? (
            <div className="mt-6 max-h-[70vh] overflow-auto rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700">
              <CVDocument data={cvQuery.data} options={{ templateId, visibility: 'admin', paperSize: 'A4', theme: 'light', locale: 'en' }} />
            </div>
          ) : null}
        </div>
      </div>

      {isPreviewOpen ? (
        <PdfPreviewDialog
          blob={blob}
          error={error}
          isLoading={isGenerating}
          title="Export CV Preview"
          emptySubtitle="Latest saved admin data"
          fileName={cvPdfFileName}
          loadingMessage="Generating latest CV PDF..."
          onClose={() => setIsPreviewOpen(false)}
          onRetry={() => void regeneratePdf()}
        />
      ) : null}
    </section>
  );
}
