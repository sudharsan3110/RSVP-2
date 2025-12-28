import { protectedRoutes } from '@/lib/routes';
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/use-cases/', '/college-events'],
        disallow: protectedRoutes,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
