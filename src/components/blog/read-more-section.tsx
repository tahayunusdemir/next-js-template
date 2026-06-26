import { NewspaperIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { formatPostDate } from '@/libs/Blog';
import type { ResolvedPost } from '@/libs/Blog';
import { Link } from '@/libs/I18nNavigation';

// Suggests related posts at the end of an article, ranked upstream by shared tags.
export function ReadMoreSection(props: { posts: ResolvedPost[] }) {
  const t = useTranslations('Blog');
  const locale = useLocale();

  if (props.posts.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-dashed">
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <h2 className="mb-8 font-heading text-2xl font-semibold tracking-tight">
          {t('read_more')}
        </h2>
        <div className="flex flex-col gap-6">
          {props.posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group grid grid-cols-1 items-center gap-4 sm:grid-cols-[10rem_1fr]"
            >
              <div
                aria-hidden
                className="relative hidden aspect-video items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br from-muted to-background sm:flex"
              >
                <NewspaperIcon className="size-6 text-muted-foreground/40" />
              </div>
              <div className="space-y-1">
                <h3 className="line-clamp-2 font-medium tracking-tight group-hover:underline">
                  {post.title}
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{post.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <time dateTime={post.date}>{formatPostDate(post.date, locale)}</time>
                  <span aria-hidden>·</span>
                  <span>{t('min_read', { minutes: post.readingMinutes })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
