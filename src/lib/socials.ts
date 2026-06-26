import {
  SiGithub,
  SiInstagram,
  SiLetterboxd,
  SiSteam,
  SiTiktok,
  SiX,
  SiYoutube,
} from '@icons-pack/react-simple-icons';
import { GlobeIcon, Link2Icon } from 'lucide-react';

type IconComponent = React.ComponentType<{ className?: string }>;

type SocialPlatformId =
  | 'letterboxd'
  | 'steam'
  | 'x'
  | 'instagram'
  | 'linkedin'
  | 'github'
  | 'youtube'
  | 'tiktok'
  | 'website';

type SocialPlatform = {
  id: SocialPlatformId;
  label: string;
  Icon: IconComponent;
  /** Matches the URL hostname. The generic `website` fallback has none. */
  match?: RegExp;
};

// LinkedIn has no brand mark in simple-icons (trademark removal); it falls back to
// a neutral link icon. The generic `website` entry is the last-resort fallback.
const PLATFORMS: SocialPlatform[] = [
  { id: 'letterboxd', label: 'Letterboxd', Icon: SiLetterboxd, match: /letterboxd\.com$/u },
  {
    id: 'steam',
    label: 'Steam',
    Icon: SiSteam,
    match: /(steamcommunity|store\.steampowered)\.com$/u,
  },
  { id: 'x', label: 'X', Icon: SiX, match: /(^|\.)(twitter|x)\.com$/u },
  { id: 'instagram', label: 'Instagram', Icon: SiInstagram, match: /instagram\.com$/u },
  { id: 'linkedin', label: 'LinkedIn', Icon: Link2Icon, match: /linkedin\.com$/u },
  { id: 'github', label: 'GitHub', Icon: SiGithub, match: /github\.com$/u },
  { id: 'youtube', label: 'YouTube', Icon: SiYoutube, match: /(youtube\.com|youtu\.be)$/u },
  { id: 'tiktok', label: 'TikTok', Icon: SiTiktok, match: /tiktok\.com$/u },
];

const WEBSITE: SocialPlatform = { id: 'website', label: 'Website', Icon: GlobeIcon };

// Parses a URL, tolerating a missing protocol.
function parseUrl(url: string) {
  const candidate = /^https?:\/\//iu.test(url) ? url : `https://${url}`;

  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

/**
 * Resolves the platform for a social URL by its hostname.
 * @param url - The raw social URL.
 * @returns The matched platform, or the generic website fallback.
 */
export function detectPlatform(url: string): SocialPlatform {
  const parsed = parseUrl(url);

  if (!parsed) {
    return WEBSITE;
  }

  const host = parsed.hostname.replace(/^www\./u, '');

  return PLATFORMS.find((platform) => platform.match?.test(host)) ?? WEBSITE;
}

/**
 * Builds a compact label for a social URL: `@handle` from the last path segment
 * where it reads naturally, otherwise the bare hostname.
 * @param url - The raw social URL.
 * @returns The shortened display label.
 */
export function shortHandle(url: string) {
  const parsed = parseUrl(url);

  if (!parsed) {
    return url;
  }

  const host = parsed.hostname.replace(/^www\./u, '');
  const segments = parsed.pathname.split('/').filter(Boolean);
  const last = segments.at(-1)?.replace(/^@/u, '');

  if (last && segments.length <= 2) {
    return `@${last}`;
  }

  return host;
}
