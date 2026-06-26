import { ArrowRightIcon, PlusIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { CategoryIcon } from '@/components/community/category-icon';
import { CategoryList } from '@/components/community/category-list';
import { CommunityEmpty } from '@/components/community/community-empty';
import { FeedPagination } from '@/components/community/feed-pagination';
import { PostCard } from '@/components/community/post-card';
import { SortTabs } from '@/components/community/sort-tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import { initialsOf, profileDisplayName } from '@/lib/profile';
import { cn } from '@/lib/utils';
import type { PostListItem } from '@/libs/Community';
import { Link } from '@/libs/I18nNavigation';
import type { Connection } from '@/libs/Social';
import type { CommunityCategory, CommunitySort } from '@/types/Community';
import { COMMUNITY_PAGE_SIZE } from '@/validations/CommunityValidation';

// Shared community feed body: a left category list and a right post feed, serving both the
// index (no `activeCategory`) and a single category. `basePath` roots every link so the same
// view powers the public `/community` feed and the dashboard `/dashboard/community` feed.
// `interactive` gates the "new post" button — visitors who aren't signed in can't post, so
// the public feed hides it and surfaces a newest-member teaser in the sidebar instead, linking
// to the full `/community/members` list.
export async function CommunityFeed(props: {
  locale: string;
  basePath: string;
  interactive: boolean;
  sort: CommunitySort;
  page: number;
  items: PostListItem[];
  total: number;
  counts: Map<string, number>;
  activeCategory?: CommunityCategory;
  members?: Connection[];
}) {
  const t = await getTranslations({ locale: props.locale, namespace: 'CommunityPage' });
  const { activeCategory } = props;
  const totalPages = Math.ceil(props.total / COMMUNITY_PAGE_SIZE);

  const newBase = `${props.basePath}/new`;
  const newPostHref = activeCategory ? `${newBase}?category=${activeCategory.slug}` : newBase;

  // `listMembers` returns most-recently-joined first, so the head is the newest member.
  const newestMember = props.members?.[0];
  const newestName = newestMember ? profileDisplayName(newestMember) : '';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {activeCategory ? (
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-foreground">
              <CategoryIcon name={activeCategory.icon} className="size-6" />
            </span>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                {t(`category_${activeCategory.slug}_name`)}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`category_${activeCategory.slug}_tagline`)}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
        )}

        {props.interactive ? (
          <Link href={newPostHref} className={cn(buttonVariants(), 'rounded-full')}>
            <PlusIcon className="size-4" />
            {t('new_post')}
          </Link>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className="flex flex-col gap-6">
          <CategoryList
            locale={props.locale}
            basePath={props.basePath}
            counts={props.counts}
            activeSlug={activeCategory?.slug}
          />

          {activeCategory ? (
            <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <h2 className="text-sm font-medium">{t('related_communities')}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {activeCategory.sampleCommunities.map((name) => (
                  <li key={name}>
                    <a
                      href={`https://www.reddit.com/${name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {props.members ? (
            <Link
              href="/community/members"
              className="group flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-colors hover:bg-muted"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">{t('members')}</h2>
                <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>

              {newestMember ? (
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 rounded-xl">
                    <AvatarImage src={newestMember.avatarUrl ?? ''} alt={newestName} />
                    <AvatarFallback className="rounded-xl text-xs">
                      {initialsOf(newestName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-xs text-muted-foreground">{t('members_newest')}</span>
                    <span className="truncate text-sm font-medium">{newestName}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('members_empty')}</p>
              )}

              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                {t('members_view_all')}
              </span>
            </Link>
          ) : null}
        </aside>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-medium">
              {activeCategory ? t('posts') : t('recent')}
            </h2>
            <SortTabs sort={props.sort} />
          </div>

          {props.items.length ? (
            <div className="flex flex-col gap-3">
              {props.items.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  locale={props.locale}
                  basePath={props.basePath}
                />
              ))}
            </div>
          ) : (
            <CommunityEmpty message={activeCategory ? t('category_empty') : t('empty')} />
          )}

          <FeedPagination page={props.page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
