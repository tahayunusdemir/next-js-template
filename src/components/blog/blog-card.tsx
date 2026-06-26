import { NewspaperIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { formatPostDate, getPostBadge } from '@/libs/Blog';
import type { ResolvedPost } from '@/libs/Blog';
import { Link } from '@/libs/I18nNavigation';

// A single post in the listing grid. Self-contained: it formats its own date and
// reading time from the active locale. The thumbnail is an asset-free CSS placeholder
// so the template ships without images, matching the landing page.
export function BlogCard(props: { post: ResolvedPost }) {
  const t = useTranslations('Blog');
  const locale = useLocale();
  const { post } = props;
  const [primaryTag] = post.tags;
  const badge = getPostBadge(post);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div
        aria-hidden
        className="relative flex aspect-video items-center justify-center overflow-hidden border-b bg-gradient-to-br from-muted to-background"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] [background-size:16px_16px] opacity-60" />
        <NewspaperIcon className="size-10 text-muted-foreground/40 transition-transform duration-300 group-hover:scale-110" />
        {post.featured ? <Badge className="absolute top-3 left-3">{t('featured')}</Badge> : null}
        {badge ? (
          <Badge variant="secondary" className="absolute top-3 right-3">
            {badge === 'new' ? t('badge_new') : t('badge_updated')}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        {primaryTag ? (
          <Badge variant="outline" className="mb-3 w-fit">
            {t(`tag_${primaryTag}`)}
          </Badge>
        ) : null}
        <h3 className="font-heading text-lg font-semibold tracking-tight text-balance group-hover:underline">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-pretty text-muted-foreground">
          {post.description}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-5 text-xs text-muted-foreground">
          <time dateTime={post.date}>{formatPostDate(post.date, locale)}</time>
          <span aria-hidden>·</span>
          <span>{t('min_read', { minutes: post.readingMinutes })}</span>
        </div>
      </div>
    </Link>
  );
}
