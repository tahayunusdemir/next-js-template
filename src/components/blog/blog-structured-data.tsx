import type { Locale } from '@/libs/Blog';
import { AppConfig } from '@/utils/AppConfig';
import { getBaseUrl, getI18nPath } from '@/utils/Helpers';

function JsonLd(props: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script content
      dangerouslySetInnerHTML={{ __html: JSON.stringify(props.data) }}
    />
  );
}

// Emits `Blog` JSON-LD for the listing so it is eligible for rich results.
export function BlogListStructuredData(props: {
  locale: Locale;
  title: string;
  description: string;
}) {
  const baseUrl = getBaseUrl();

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': `${baseUrl}${getI18nPath('/blog', props.locale)}`,
        name: props.title,
        description: props.description,
        publisher: { '@type': 'Organization', name: AppConfig.name, url: baseUrl },
      }}
    />
  );
}

// Emits `BlogPosting` JSON-LD for a single article.
export function BlogPostStructuredData(props: {
  locale: Locale;
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  authorName: string;
}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${getI18nPath(`/blog/${props.slug}`, props.locale)}`;

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': url,
        mainEntityOfPage: url,
        headline: props.title,
        description: props.description,
        image: `${url}/opengraph-image`,
        datePublished: props.date,
        dateModified: props.updated ?? props.date,
        author: { '@type': 'Person', name: props.authorName },
        publisher: { '@type': 'Organization', name: AppConfig.name, url: baseUrl },
      }}
    />
  );
}
