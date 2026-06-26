import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './I18nRouting';

// This project uses Crowdin as the localization software.
// As a developer, you only need to take care of the English (or another default language) version.
// Other languages are automatically generated and handled by Crowdin.

// The localisation files are synced with Crowdin using GitHub Actions.
// By default, there are 3 ways to sync the message files:
// 1. Automatically sync on push to the `main` branch
// 2. Run manually the workflow on GitHub Actions
// 3. Every 24 hours at 5am, the workflow will run automatically

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // Large feature areas live in their own per-locale files (src/locales/<area>/)
  // to keep each message file readable; all of them are merged into one message tree.
  const [
    base,
    cineType,
    marketing,
    dashboard,
    cineTest,
    community,
    films,
    profile,
    cineMatch,
    achievements,
  ] = await Promise.all([
    import(`../locales/${locale}.json`),
    import(`../locales/cinetype/${locale}.json`),
    import(`../locales/marketing/${locale}.json`),
    import(`../locales/dashboard/${locale}.json`),
    import(`../locales/cinetest/${locale}.json`),
    import(`../locales/community/${locale}.json`),
    import(`../locales/films/${locale}.json`),
    import(`../locales/profile/${locale}.json`),
    import(`../locales/cinematch/${locale}.json`),
    import(`../locales/achievements/${locale}.json`),
  ]);

  return {
    locale,
    messages: {
      ...base.default,
      ...cineType.default,
      ...marketing.default,
      ...dashboard.default,
      ...cineTest.default,
      ...community.default,
      ...films.default,
      ...profile.default,
      ...cineMatch.default,
      ...achievements.default,
    },
  };
});
