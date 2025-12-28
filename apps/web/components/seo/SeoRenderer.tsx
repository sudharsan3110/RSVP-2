import SeoPage from './SeoPage';
import SeoSection from './SeoSection';
import SeoFAQ from './SeoFAQ';
import Link from 'next/link';
import { getInternalLinks } from '@/lib/seo-links';

export default function SeoRenderer({ page }: any) {
  const links = getInternalLinks(page.slug);

  return (
    <SeoPage title={page.title} description={page.description}>
      {page.sections.map((section: any, i: number) => (
        <SeoSection key={i} title={section.title}>
          <ul className="list-disc pl-6">
            {section.bullets.map((b: string, j: number) => (
              <li key={j}>{b}</li>
            ))}
          </ul>
          {section.cta && (
            <Link href={section.cta.href} className="inline-block mt-3 text-blue-600 underline">
              {section.cta.label}
            </Link>
          )}
        </SeoSection>
      ))}

      <SeoFAQ items={page.faqs} />

      {/* Internal Links */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Related Pages</h2>
        <ul className="list-disc pl-6">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-blue-600 underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </SeoPage>
  );
}
