// Shared unions for the community (Reddit-style discussion) feature. The category
// registry that pairs these slugs with an icon and related communities lives in
// src/data/community-categories.ts; display names/taglines come from the
// `CommunityPage` i18n namespace, keyed by slug.

/** Fixed community categories (film genres), curated from docs/cinepersona-docs/reddit.md. */
export const COMMUNITY_CATEGORY_SLUGS = [
  'action',
  'animated',
  'crime-mystery-thriller',
  'documentary',
  'fantasy',
  'horror',
  'movie-news',
  'romance',
  'sci-fi',
  'superhero',
] as const;

export type CommunityCategorySlug = (typeof COMMUNITY_CATEGORY_SLUGS)[number];

/** A community category card: a film genre members open posts under. */
export type CommunityCategory = {
  slug: CommunityCategorySlug;
  /** lucide-react icon name, mapped to a component on the client. */
  icon: string;
  /** Related real subreddits surfaced in the sidebar, e.g. `r/horror`. */
  sampleCommunities: string[];
};

/** What a vote or report points at. One row type covers both posts and comments. */
export const COMMUNITY_TARGETS = ['post', 'comment'] as const;
export type CommunityTarget = (typeof COMMUNITY_TARGETS)[number];

/** Post list ordering. `hot` blends score with recency; `top` is score-only; `new` is recency. */
export const COMMUNITY_SORTS = ['hot', 'new', 'top'] as const;
export type CommunitySort = (typeof COMMUNITY_SORTS)[number];

/** Why a post or comment was reported. */
export const COMMUNITY_REPORT_REASONS = [
  'spam',
  'harassment',
  'off_topic',
  'spoiler',
  'other',
] as const;
export type CommunityReportReason = (typeof COMMUNITY_REPORT_REASONS)[number];
