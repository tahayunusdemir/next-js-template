import { Env } from '@/libs/Env';
import { routing } from '@/libs/I18nRouting';

/**
 * Resolves the public base URL of the application.
 * @returns The configured public app URL or the local development URL.
 */
export const getBaseUrl = () => {
  if (Env.NEXT_PUBLIC_APP_URL) {
    return Env.NEXT_PUBLIC_APP_URL;
  }

  return 'http://localhost:3000';
};

/**
 * Builds a locale-aware path by prefixing non-default locales.
 * @param url The base application-relative path starting with a slash.
 * @param locale The active locale identifier.
 * @returns The localized path, prefixed when the locale is not the default locale.
 */
export const getI18nPath = (url: string, locale: string) => {
  if (locale === routing.defaultLocale) {
    return url;
  }

  return `/${locale}${url}`;
};

/**
 * Derives up to two uppercase initials from a display name for avatar fallbacks.
 * @param name The display name or handle to abbreviate.
 * @returns One or two initials, or an empty string when the name has no letters.
 */
export const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/u).filter(Boolean);

  if (parts.length === 0) {
    return '';
  }

  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '';

  return `${first}${last}`.toUpperCase();
};
