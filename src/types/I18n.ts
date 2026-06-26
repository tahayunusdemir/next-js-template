import type { routing } from '@/libs/I18nRouting';
import type achievementsMessages from '@/locales/achievements/en.json';
import type cineMatchMessages from '@/locales/cinematch/en.json';
import type cineTestMessages from '@/locales/cinetest/en.json';
import type cineTypeMessages from '@/locales/cinetype/en.json';
import type communityMessages from '@/locales/community/en.json';
import type dashboardMessages from '@/locales/dashboard/en.json';
import type messages from '@/locales/en.json';
import type filmsMessages from '@/locales/films/en.json';
import type marketingMessages from '@/locales/marketing/en.json';
import type profileMessages from '@/locales/profile/en.json';

declare module 'next-intl' {
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages &
      typeof cineTypeMessages &
      typeof marketingMessages &
      typeof dashboardMessages &
      typeof cineTestMessages &
      typeof communityMessages &
      typeof filmsMessages &
      typeof profileMessages &
      typeof cineMatchMessages &
      typeof achievementsMessages;
  }
}
