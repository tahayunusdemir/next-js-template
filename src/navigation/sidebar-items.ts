import {
  BellIcon,
  BookmarkIcon,
  EyeIcon,
  FilmIcon,
  HeartHandshakeIcon,
  HouseIcon,
  MessageCircleIcon,
  SettingsIcon,
  SparklesIcon,
  TrophyIcon,
  UserRoundIcon,
  UsersIcon,
  UsersRoundIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Single source of truth for dashboard navigation. The sidebar, the command
// search dialog, and the header breadcrumb all derive their items from here.
// Titles are stored as next-intl keys (literal union) and translated at render.

export type NavTitleKey =
  | 'home_link'
  | 'cinetest_link'
  | 'films_link'
  | 'watchlist_link'
  | 'watched_link'
  | 'achievements_link'
  | 'messages_link'
  | 'community_link'
  | 'members_link'
  | 'matches_link'
  | 'notifications_link'
  | 'public_profile_link'
  | 'settings_link';

type NavLabelKey = 'group_library' | 'group_social' | 'group_account';

export type NavBadge = 'new' | 'soon';

type NavItem = {
  id: string;
  titleKey: NavTitleKey;
  url: string;
  icon: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
};

export type NavGroup = {
  id: string;
  labelKey?: NavLabelKey;
  items: NavItem[];
};

export const sidebarItems: NavGroup[] = [
  {
    id: 'overview',
    items: [{ id: 'home', titleKey: 'home_link', url: '/dashboard/', icon: HouseIcon }],
  },
  {
    id: 'library',
    labelKey: 'group_library',
    items: [
      {
        id: 'cinetest',
        titleKey: 'cinetest_link',
        url: '/dashboard/cinetest/',
        icon: SparklesIcon,
        badge: 'new',
      },
      { id: 'films', titleKey: 'films_link', url: '/dashboard/films/', icon: FilmIcon },
      {
        id: 'watchlist',
        titleKey: 'watchlist_link',
        url: '/dashboard/watchlist/',
        icon: BookmarkIcon,
      },
      { id: 'watched', titleKey: 'watched_link', url: '/dashboard/watched/', icon: EyeIcon },
      {
        id: 'achievements',
        titleKey: 'achievements_link',
        url: '/dashboard/achievements/',
        icon: TrophyIcon,
      },
    ],
  },
  {
    id: 'social',
    labelKey: 'group_social',
    items: [
      {
        id: 'community',
        titleKey: 'community_link',
        url: '/dashboard/community/',
        icon: UsersRoundIcon,
      },
      { id: 'members', titleKey: 'members_link', url: '/dashboard/members/', icon: UsersIcon },
      {
        id: 'matches',
        titleKey: 'matches_link',
        url: '/dashboard/matches/',
        icon: HeartHandshakeIcon,
        badge: 'new',
      },
      {
        id: 'messages',
        titleKey: 'messages_link',
        url: '/dashboard/messages/',
        icon: MessageCircleIcon,
      },
      {
        id: 'notifications',
        titleKey: 'notifications_link',
        url: '/dashboard/notifications/',
        icon: BellIcon,
      },
    ],
  },
  {
    id: 'account',
    labelKey: 'group_account',
    items: [
      {
        id: 'profile',
        titleKey: 'public_profile_link',
        url: '/dashboard/profile/',
        icon: UserRoundIcon,
      },
      {
        id: 'settings',
        titleKey: 'settings_link',
        url: '/dashboard/settings/',
        icon: SettingsIcon,
      },
    ],
  },
];
