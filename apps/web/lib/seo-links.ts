import { seoPages } from '@/content/seo/pages';

export function getInternalLinks(currentSlug: string) {
  return seoPages
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 3)
    .map((p) => ({
      href:
        p.type === 'use-case'
          ? `/use-cases/${p.slug}`
          : p.type === 'alternative'
            ? `/alternatives/${p.slug}`
            : `/problems/${p.slug}`,
      label: p.title,
    }));
}
