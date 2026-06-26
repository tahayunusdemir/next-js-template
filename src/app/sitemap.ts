import type { MetadataRoute } from 'next';
import { COMMUNITY_CATEGORIES } from '@/data/community-categories';
import { getAllTags, getPostSitemapEntries } from '@/libs/Blog';
import { routing } from '@/libs/I18nRouting';
import { getBaseUrl, getI18nPath } from '@/utils/Helpers';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const entries: { path: string; lastModified: Date }[] = [
    { path: '', lastModified: now },
    { path: '/pricing', lastModified: now },
    { path: '/about', lastModified: now },
    { path: '/privacy', lastModified: now },
    { path: '/terms', lastModified: now },
    { path: '/blog', lastModified: now },
    { path: '/blog/tags', lastModified: now },
    ...getAllTags().map((tag) => ({ path: `/blog/tag/${tag}`, lastModified: now })),
    ...getPostSitemapEntries().map((entry) => ({
      path: `/blog/${entry.slug}`,
      lastModified: new Date(entry.lastModified),
    })),
    { path: '/community', lastModified: now },
    { path: '/community/members', lastModified: now },
    ...COMMUNITY_CATEGORIES.map((category) => ({
      path: `/community/${category.slug}`,
      lastModified: now,
    })),
  ];

  return entries.map((entry) => ({
    url: `${baseUrl}${entry.path}`,
    lastModified: entry.lastModified,
    alternates: {
      languages: Object.fromEntries(
        routing.locales
          .filter((locale) => locale !== routing.defaultLocale)
          .map((locale) => [locale, `${baseUrl}${getI18nPath(entry.path, locale)}`]),
      ),
    },
  }));
}
