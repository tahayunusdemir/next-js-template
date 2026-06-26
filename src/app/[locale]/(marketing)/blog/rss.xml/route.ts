import { getTranslations } from 'next-intl/server';
import { getAllPosts } from '@/libs/Blog';
import { getBaseUrl, getI18nPath } from '@/utils/Helpers';

export const dynamic = 'force-static';

// Escapes the five XML predefined entities for safe inclusion in element content.
function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

// Emits a per-locale RSS 2.0 feed of all posts, newest first. Distribution staple, built
// from the same content layer as the listing — no extra dependency. Mirrors
// astro-erudite's rss.xml endpoint.
export async function GET(_request: Request, ctx: { params: Promise<{ locale: string }> }) {
  const { locale } = await ctx.params;
  const t = await getTranslations({ locale, namespace: 'BlogPage' });
  const baseUrl = getBaseUrl();
  const blogUrl = `${baseUrl}${getI18nPath('/blog', locale)}`;
  const posts = getAllPosts(locale);

  const items = posts
    .map((post) => {
      const url = `${baseUrl}${getI18nPath(`/blog/${post.slug}`, locale)}`;
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escapeXml(post.description)}</description>`,
        `      <pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(t('meta_title'))}</title>`,
    `    <link>${blogUrl}</link>`,
    `    <description>${escapeXml(t('meta_description'))}</description>`,
    `    <language>${locale}</language>`,
    `    <atom:link href="${blogUrl}/rss.xml" rel="self" type="application/rss+xml" />`,
    items,
    '  </channel>',
    '</rss>',
  ].join('\n');

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
