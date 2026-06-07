import { PageTransition } from '../components/PageTransition';
import { Section } from '@web-cv/shared-ui';
import { Seo } from '../components/Seo';
import { useCertifications } from '../hooks/usePortfolioContent';

export default function Certifications() {
  const { data: certifications } = useCertifications();
  const hasCertifications = certifications.length > 0;

  return (
    <PageTransition>
      <Seo title="Certifications" description="Professional certifications, issuers, dates, credential links, and downloads." path="/certifications" />
      {hasCertifications ? (
        <Section eyebrow="Certifications" title="Verified professional learning" description="Credentials that support architecture, delivery, product practice, and modern web engineering.">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {certifications.map((certificate) => (
              <article key={certificate.name} className="flex flex-col rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">{certificate.issueDate}</p>
                <h2 className="mt-4 font-display text-xl font-bold text-slate-950 dark:text-white">{certificate.name}</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{certificate.issuer}</p>
                {(certificate.credentialUrl !== '#' || certificate.downloadUrl) && (
                  <div className="mt-auto pt-6 flex flex-wrap gap-3">
                    {certificate.credentialUrl !== '#' && (
                      <a href={certificate.credentialUrl} className="btn-primary" target="_blank" rel="noopener noreferrer">
                        Credential URL
                      </a>
                    )}
                    {certificate.downloadUrl && (
                      <a href={certificate.downloadUrl} className="btn-secondary" target="_blank" rel="noopener noreferrer" download>
                        Download certificate
                      </a>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </Section>
      ) : null}
    </PageTransition>
  );
}
