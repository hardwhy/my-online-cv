import { CVDocument, cvPreviewCss } from '@web-cv-services/cv-renderer';
import { PageTransition } from '../components/PageTransition';
import { Seo } from '../components/Seo';
import { useCVData } from '../hooks/usePortfolioContent';

export default function Cv() {
  const { data, error, isLoading, refetch } = useCVData();

  return (
    <PageTransition>
      <Seo title="CV" description="ATS-friendly professional CV preview." path="/cv" />
      <style>{cvPreviewCss}</style>
      <section className="bg-slate-100 px-4 py-8 dark:bg-slate-950 print:bg-white print:p-0">
        <div className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">CV Preview</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-slate-950 dark:text-white">ATS-friendly CV</h1>
          </div>
          <button className="btn-secondary" type="button" onClick={() => window.print()}>
            Print
          </button>
        </div>

        {isLoading ? <p className="mx-auto max-w-4xl rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300 print:hidden">Loading CV...</p> : null}
        {error ? (
          <div className="mx-auto max-w-4xl rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100 print:hidden">
            <p>{error instanceof Error ? error.message : 'Unable to load CV data.'}</p>
            <button className="mt-4 rounded-full bg-red-700 px-4 py-2 text-sm font-bold text-white" type="button" onClick={() => void refetch()}>
              Retry
            </button>
          </div>
        ) : null}

        {data ? (
          <div className="mx-auto max-w-4xl bg-white p-8 shadow-soft dark:bg-white print:max-w-none print:p-0 print:shadow-none">
            <CVDocument data={data} options={{ templateId: 'modern-ats', visibility: 'public', paperSize: 'A4', theme: 'light', locale: 'en' }} />
          </div>
        ) : null}
      </section>
    </PageTransition>
  );
}
