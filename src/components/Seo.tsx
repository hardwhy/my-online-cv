import { useEffect } from 'react';
import { useProfile } from '../hooks/usePortfolioContent';

type SeoProps = {
  title: string;
  description: string;
  path?: string;
};

const siteUrl = 'https://example.com';

const setMeta = (selector: string, attribute: 'content' | 'href', value: string) => {
  const element = document.head.querySelector(selector);
  if (element) {
    element.setAttribute(attribute, value);
  }
};

export function Seo({ title, description, path = '/' }: SeoProps) {
  const { data: profile } = useProfile();

  useEffect(() => {
    const fullTitle = `${title} | ${profile.fullName}`;
    const canonical = `${siteUrl}${path}`;

    document.title = fullTitle;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', canonical);
  }, [description, path, profile.fullName, title]);

  return null;
}
