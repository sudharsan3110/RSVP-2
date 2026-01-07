import { Metadata } from 'next';
import { seoPages } from '@/content/seo/pages';
import SeoRenderer from '@/components/seo/SeoRenderer';

const page = seoPages.find((p) => p.slug === 'college-events')!;

export function generateMetadata(): Metadata {
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: page.canonical,
    },
    openGraph: {
      title: page.og.title,
      description: page.og.description,
      url: page.canonical,
      siteName: 'RSVP',
      images: [
        {
          url: page.og.image,
          width: 1200,
          height: 630,
          alt: page.og.title,
        },
      ],
      type: page.og.type,
      locale: 'en_US',
    },

    twitter: {
      card: page.twitter.card as any,
      title: page.twitter.title,
      description: page.twitter.description,
      images: [page.twitter.image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function Page() {
  return <SeoRenderer page={page} />;
}
