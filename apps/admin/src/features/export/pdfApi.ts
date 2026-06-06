import type { CVExportOptions } from '@web-cv-services/shared-types';
import { defaultPdfFileName } from '@web-cv/shared-ui';

export type AdminPdfRequestOptions = Partial<CVExportOptions> & {
  authToken?: string;
};

const defaultOptions: CVExportOptions = {
  templateId: 'modern-ats',
  visibility: 'admin',
  paperSize: 'A4',
  theme: 'light',
  locale: 'en',
};

export const cvPdfFileName = defaultPdfFileName;

export function getPdfApiUrl() {
  return import.meta.env.VITE_PDF_API_URL?.replace(/\/$/, '') ?? '';
}

export async function fetchAdminCvPdf(options: AdminPdfRequestOptions = {}) {
  const baseUrl = getPdfApiUrl();
  if (!baseUrl) {
    throw new Error('PDF export API is not configured. Add VITE_PDF_API_URL to enable admin exports.');
  }

  const { authToken, ...requestOptions } = options;
  const response = await fetch(`${baseUrl}/v1/cv/pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({ ...defaultOptions, ...requestOptions }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `Unable to generate CV PDF (${response.status}).`);
  }

  return response.blob();
}
