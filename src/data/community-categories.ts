import type { CommunityCategory, CommunityCategorySlug } from '@/types/Community';

/** Category preselected in the new-post form when none is supplied (the general news feed). */
export const DEFAULT_COMMUNITY_CATEGORY: CommunityCategorySlug = 'movie-news';

/**
 * The fixed set of community categories (film genres) members can post under, in
 * display order. Each entry pairs a slug with a lucide icon and a few related real
 * subreddits, curated from docs/cinepersona-docs/reddit.md. Display name and tagline
 * are resolved from the `CommunityPage` i18n namespace, keyed by slug.
 */
export const COMMUNITY_CATEGORIES: CommunityCategory[] = [
  { slug: 'action', icon: 'Swords', sampleCommunities: ['r/JamesBond', 'r/transformers'] },
  { slug: 'animated', icon: 'Sparkles', sampleCommunities: ['r/cartoons', 'r/Shrek'] },
  {
    slug: 'crime-mystery-thriller',
    icon: 'Fingerprint',
    sampleCommunities: ['r/Dhurandhar', 'r/obsessionmovie', 'r/stephenking'],
  },
  {
    slug: 'documentary',
    icon: 'Clapperboard',
    sampleCommunities: ['r/Documentaries', 'r/NetflixDocumentaries', 'r/WarMovies'],
  },
  {
    slug: 'fantasy',
    icon: 'Wand2',
    sampleCommunities: ['r/lotr', 'r/harrypotter', 'r/witcher', 'r/Fantasy'],
  },
  {
    slug: 'horror',
    icon: 'Ghost',
    sampleCommunities: ['r/horror', 'r/HorrorMovies', 'r/backroomsfilm'],
  },
  {
    slug: 'movie-news',
    icon: 'Newspaper',
    sampleCommunities: ['r/movies', 'r/okbuddycinephile', 'r/moviecritic'],
  },
  { slug: 'romance', icon: 'Heart', sampleCommunities: ['r/romancemovies', 'r/twilight'] },
  { slug: 'sci-fi', icon: 'Rocket', sampleCommunities: ['r/StarWars', 'r/scifi', 'r/Stargate'] },
  {
    slug: 'superhero',
    icon: 'Shield',
    sampleCommunities: ['r/marvelstudios', 'r/Marvel', 'r/batman', 'r/DC_Cinematic'],
  },
];

/**
 * Looks up a community category by its slug.
 * @param slug - The category slug to find.
 * @returns The matching category, or undefined when the slug is unknown.
 */
export function getCommunityCategory(slug: string) {
  return COMMUNITY_CATEGORIES.find((category) => category.slug === slug);
}
