import { posts } from '@/content/blog';
import type { AuthorKey } from './Authors';
import type { routing } from './I18nRouting';

// Supported content locales, derived from the i18n routing config.
export type Locale = (typeof routing.locales)[number];

// Known blog tag keys; labels are resolved from the `Blog` i18n namespace.
export type BlogTag = 'engineering' | 'design' | 'product' | 'ai';

// Visual variants for the callout block.
export type CalloutVariant = 'note' | 'tip' | 'warning' | 'info';

// A single rendered block of post body content.
export type BlogBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'code'; lang?: string; code: string }
  | { type: 'quote'; text: string }
  | { type: 'callout'; variant: CalloutVariant; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string };

// Per-locale, user-visible post body. The locale folders act as the translation.
type LocalizedContent = {
  title: string;
  description: string;
  blocks: BlogBlock[];
};

// A blog post: locale-agnostic metadata plus localized content.
export type BlogPost = {
  slug: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** ISO date (YYYY-MM-DD) of the last meaningful revision, if any. */
  updated?: string;
  author: AuthorKey;
  tags: BlogTag[];
  featured?: boolean;
  content: Record<Locale, LocalizedContent>;
};

// A heading extracted for the table of contents.
export type PostHeading = { id: string; text: string };

// A post resolved for a given locale, ready for cards and metadata.
export type ResolvedPost = {
  slug: string;
  date: string;
  updated?: string;
  author: AuthorKey;
  tags: BlogTag[];
  featured: boolean;
  title: string;
  description: string;
  readingMinutes: number;
};

const WORDS_PER_MINUTE = 200;

// How recently a post must be published to earn the "new" badge.
const NEW_WINDOW_DAYS = 21;

// Builds a URL- and anchor-safe id from heading text.
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replaceAll(/[^\da-z\s-]/gu, '')
    .replaceAll(/\s+/gu, '-')
    .replaceAll(/-+/gu, '-');
}

// Estimates reading time in whole minutes from the body word count.
export function readingMinutes(blocks: BlogBlock[]): number {
  let words = 0;
  for (const block of blocks) {
    if (block.type === 'list') {
      words += block.items.join(' ').split(/\s+/u).length;
    } else if (block.type === 'code') {
      words += block.code.split(/\s+/u).length;
    } else if (block.type === 'image') {
      words += block.caption ? block.caption.split(/\s+/u).length : 0;
    } else {
      words += block.text.split(/\s+/u).length;
    }
  }

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

// Assigns a unique id to each heading block, keyed by its index in `blocks`. Duplicate
// slugs are suffixed in document order so the table of contents and the rendered anchors
// always agree, even when two headings share the same text.
export function getHeadingIds(blocks: BlogBlock[]): Map<number, string> {
  const seen = new Map<string, number>();
  const ids = new Map<number, string>();

  for (const [index, block] of blocks.entries()) {
    if (block.type !== 'heading') {
      continue;
    }

    const base = slugify(block.text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    ids.set(index, count === 0 ? base : `${base}-${count}`);
  }

  return ids;
}

// Extracts heading blocks as table-of-contents entries with stable, unique ids.
export function getHeadings(blocks: BlogBlock[]): PostHeading[] {
  const ids = getHeadingIds(blocks);

  return blocks.flatMap((block, index) =>
    block.type === 'heading'
      ? [{ id: ids.get(index) ?? slugify(block.text), text: block.text }]
      : [],
  );
}

function toResolved(post: BlogPost, content: LocalizedContent): ResolvedPost {
  return {
    slug: post.slug,
    date: post.date,
    updated: post.updated,
    author: post.author,
    tags: post.tags,
    featured: post.featured ?? false,
    title: content.title,
    description: content.description,
    readingMinutes: readingMinutes(content.blocks),
  };
}

// Normalizes text for accent-insensitive, case-insensitive substring search.
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036F]/gu, '');
}

// True when the query matches the post title or description.
function matchesQuery(post: ResolvedPost, query: string): boolean {
  const haystack = normalize(`${post.title} ${post.description}`);
  return normalize(query)
    .split(/\s+/u)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

// Returns every post for a locale, newest first, optionally filtered by tag and query.
export function getAllPosts(
  locale: Locale,
  options?: { tag?: BlogTag; query?: string },
): ResolvedPost[] {
  const query = options?.query?.trim();

  return posts
    .filter((post) => (options?.tag ? post.tags.includes(options.tag) : true))
    .flatMap((post) => {
      const content = post.content[locale];
      return content ? [toResolved(post, content)] : [];
    })
    .filter((post) => (query ? matchesQuery(post, query) : true))
    .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Returns the published-newest-first neighbours of a post for prev/next navigation.
export function getNeighbours(
  locale: Locale,
  slug: string,
): { previous: ResolvedPost | null; next: ResolvedPost | null } {
  const all = getAllPosts(locale);
  const index = all.findIndex((post) => post.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? (all[index - 1] ?? null) : null,
    next: index < all.length - 1 ? (all[index + 1] ?? null) : null,
  };
}

// Classifies a post for the listing badge: recently published, revised, or neither.
export function getPostBadge(post: ResolvedPost): 'new' | 'updated' | null {
  if (post.updated) {
    return 'updated';
  }

  const ageDays = (Date.now() - new Date(post.date).getTime()) / 86_400_000;
  return ageDays <= NEW_WINDOW_DAYS ? 'new' : null;
}

// Returns the raw post for a slug, or undefined when none matches.
export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}

// Returns every post slug for static generation.
export function getAllSlugs(): string[] {
  return posts.map((post) => post.slug);
}

// Returns each post's slug paired with its last meaningful revision date, for the sitemap.
export function getPostSitemapEntries(): { slug: string; lastModified: string }[] {
  return posts.map((post) => ({ slug: post.slug, lastModified: post.updated ?? post.date }));
}

// Returns the tag keys present across all posts, in display order.
export function getAllTags(): BlogTag[] {
  const order: BlogTag[] = ['engineering', 'design', 'product', 'ai'];
  const present = new Set(posts.flatMap((post) => post.tags));

  return order.filter((tag) => present.has(tag));
}

// Returns the post count for a tag (or all posts when omitted).
export function getTagCount(tag?: BlogTag): number {
  if (!tag) {
    return posts.length;
  }

  return posts.filter((post) => post.tags.includes(tag)).length;
}

// Returns up to `limit` related posts, ranked by shared tags then recency.
export function getRelatedPosts(
  slug: string,
  tags: BlogTag[],
  locale: Locale,
  limit = 3,
): ResolvedPost[] {
  return posts
    .filter((post) => post.slug !== slug)
    .flatMap((post) => {
      const content = post.content[locale];
      return content ? [{ post, content }] : [];
    })
    .map((entry) => ({
      ...entry,
      overlap: entry.post.tags.filter((tag) => tags.includes(tag)).length,
    }))
    .toSorted((a, b) => {
      if (a.overlap !== b.overlap) {
        return b.overlap - a.overlap;
      }
      return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
    })
    .slice(0, limit)
    .map((entry) => toResolved(entry.post, entry.content));
}

// Formats an ISO post date for display in the active locale.
export function formatPostDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}
