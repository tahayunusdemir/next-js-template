import { LayersIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { CategoryIcon } from '@/components/community/category-icon';
import { COMMUNITY_CATEGORIES } from '@/data/community-categories';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';
import type { CommunityCategorySlug } from '@/types/Community';

// Vertical category navigation shown on the left of the community feed: an "all posts" entry
// plus every category with its icon, name, and post count. The active entry is highlighted.
export async function CategoryList(props: {
  locale: string;
  basePath: string;
  counts: Map<string, number>;
  activeSlug?: CommunityCategorySlug;
}) {
  const t = await getTranslations({ locale: props.locale, namespace: 'CommunityPage' });
  const itemClass = 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors';
  const total = [...props.counts.values()].reduce((sum, count) => sum + count, 0);

  return (
    <nav aria-label={t('categories')} className="flex flex-col gap-1">
      <Link
        href={props.basePath}
        aria-current={props.activeSlug ? undefined : 'page'}
        className={cn(
          itemClass,
          props.activeSlug
            ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
            : 'bg-muted font-medium text-foreground',
        )}
      >
        <LayersIcon className="size-4 shrink-0" />
        <span className="flex-1 truncate">{t('all_posts')}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{total}</span>
      </Link>

      {COMMUNITY_CATEGORIES.map((category) => {
        const active = category.slug === props.activeSlug;

        return (
          <Link
            key={category.slug}
            href={`${props.basePath}/${category.slug}`}
            aria-current={active ? 'page' : undefined}
            className={cn(
              itemClass,
              active
                ? 'bg-muted font-medium text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <CategoryIcon name={category.icon} className="size-4 shrink-0" />
            <span className="flex-1 truncate">{t(`category_${category.slug}_name`)}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {props.counts.get(category.slug) ?? 0}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
