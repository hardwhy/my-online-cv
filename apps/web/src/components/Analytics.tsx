import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type AnalyticsState = {
  visits: number;
  cvDownloads: number;
  contactSubmissions: number;
  paths: Record<string, number>;
};

const analyticsKey = 'portfolio-analytics';

const readAnalytics = (): AnalyticsState => {
  const fallback: AnalyticsState = { visits: 0, cvDownloads: 0, contactSubmissions: 0, paths: {} };
  const raw = window.localStorage.getItem(analyticsKey);
  if (!raw) return fallback;

  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
};

const writeAnalytics = (state: AnalyticsState) => {
  window.localStorage.setItem(analyticsKey, JSON.stringify(state));
};

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    const state = readAnalytics();
    state.visits += 1;
    state.paths[location.pathname] = (state.paths[location.pathname] ?? 0) + 1;
    writeAnalytics(state);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a');
      if (!link?.getAttribute('href')?.endsWith('.pdf')) return;

      const state = readAnalytics();
      state.cvDownloads += 1;
      writeAnalytics(state);
    };

    const onContactSubmission = () => {
      const state = readAnalytics();
      state.contactSubmissions += 1;
      writeAnalytics(state);
    };

    window.addEventListener('click', onClick);
    window.addEventListener('portfolio:contact-submission', onContactSubmission);
    return () => {
      window.removeEventListener('click', onClick);
      window.removeEventListener('portfolio:contact-submission', onContactSubmission);
    };
  }, []);

  return null;
}
