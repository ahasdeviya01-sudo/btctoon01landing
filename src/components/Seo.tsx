import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  path?: string;          // e.g. '/eth'
  image?: string;         // og:image  (absolute or path)
  imageAlt?: string;
}

/**
 * Lightweight per-page SEO head updater.
 * Sets <title>, meta description, OG and Twitter tags dynamically.
 * No external dependency required.
 */
export default function Seo({ title, description, path = '/', image, imageAlt }: SeoProps) {
  useEffect(() => {
    const base = 'https://btctoon.com';
    const fullUrl = base + path;
    const fullImage = image?.startsWith('http') ? image : base + (image || '/posts/post-2026-04-01.png');

    document.title = title;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', description);

    // Open Graph
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', fullUrl);
    setMeta('property', 'og:image', fullImage);
    if (imageAlt) setMeta('property', 'og:image:alt', imageAlt);

    // Twitter
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', fullImage);
    if (imageAlt) setMeta('name', 'twitter:image:alt', imageAlt);

    // Canonical
    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canon) {
      canon = document.createElement('link');
      canon.setAttribute('rel', 'canonical');
      document.head.appendChild(canon);
    }
    canon.setAttribute('href', fullUrl);
  }, [title, description, path, image, imageAlt]);

  return null;
}
