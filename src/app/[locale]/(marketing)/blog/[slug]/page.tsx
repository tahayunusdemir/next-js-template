import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AuthorCard } from '@/components/blog/author-card';
import { BlogPostStructuredData } from '@/components/blog/blog-structured-data';
import { MobileTableOfContents } from '@/components/blog/mobile-toc';
import { PostActions } from '@/components/blog/post-actions';
import { PostBody } from '@/components/blog/post-body';
import { PostKeyboardNav } from '@/components/blog/post-keyboard-nav';
import { PrevNextNav } from '@/components/blog/prev-next-nav';
import { ReadMoreSection } from '@/components/blog/read-more-section';
import { ReadingProgress } from '@/components/blog/reading-progress';
import { TocMinimap } from '@/components/blog/toc-minimap';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { authors } from '@/libs/Authors';
import {
  formatPostDate,
  getAllSlugs,
  getHeadings,
  getNeighbours,
  getPostBySlug,
  getRelatedPosts,
  readingMinutes,
} from '@/libs/Blog';
import { Link } from '@/libs/I18nNavigation';
import { getBaseUrl, getI18nPath } from '@/utils/Helpers';

type BlogPostPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  const content = post.content[locale];

  if (!content) {
    return {};
  }

  const { title, description } = content;

  return {
    title,
    description,
    alternates: { canonical: getI18nPath(`/blog/${slug}`, locale) },
    openGraph: { title, description, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);

  const post = getPostBySlug(slug);
  const content = post?.content[locale];

  if (!post || !content) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'Blog' });
  const tTeam = await getTranslations({ locale, namespace: 'Team' });

  const headings = getHeadings(content.blocks);
  const related = getRelatedPosts(post.slug, post.tags, locale);
  const { previous, next } = getNeighbours(locale, post.slug);
  const authorName = tTeam(`${authors[post.author].teamKey}_name`);

  const calloutLabels = {
    note: t('callout_note'),
    tip: t('callout_tip'),
    warning: t('callout_warning'),
    info: t('callout_info'),
  };

  const baseUrl = getBaseUrl();
  const shareUrl = `${baseUrl}${getI18nPath(`/blog/${post.slug}`, locale)}`;

  return (
    <>
      <ReadingProgress />
      <PostKeyboardNav previousSlug={previous?.slug} nextSlug={next?.slug} />

      <BlogPostStructuredData
        locale={locale}
        slug={post.slug}
        title={content.title}
        description={content.description}
        date={post.date}
        updated={post.updated}
        authorName={authorName}
      />

      <div className="border-b border-dashed">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Link
              href="/blog"
              aria-label={t('back_to_blog')}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'icon-sm' }),
                'rounded-full',
              )}
            >
              <ArrowLeftIcon className="size-4" />
            </Link>
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {t(`tag_${tag}`)}
              </Badge>
            ))}
            <span className="ms-auto flex items-center gap-2">
              <time dateTime={post.date}>{formatPostDate(post.date, locale)}</time>
              <span aria-hidden>·</span>
              <span>{t('min_read', { minutes: readingMinutes(content.blocks) })}</span>
            </span>
          </div>

          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {content.title}
          </h1>
          <p className="max-w-3xl text-lg text-pretty text-muted-foreground">
            {content.description}
          </p>
          {post.updated ? (
            <p className="text-sm text-muted-foreground">
              {t('updated_on', { date: formatPostDate(post.updated, locale) })}
            </p>
          ) : null}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <AuthorCard authorKey={post.author} />
            <PostActions shareUrl={shareUrl} />
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_16rem] lg:px-8 lg:py-16">
        <article className="min-w-0">
          <PostBody
            blocks={content.blocks}
            calloutLabels={calloutLabels}
            headingLinkLabel={t('heading_link')}
          />
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col items-end">
            <TocMinimap headings={headings} label={t('on_this_page')} />
          </div>
        </aside>
      </div>

      <div className="pb-16">
        <PrevNextNav previous={previous} next={next} />
      </div>

      <ReadMoreSection posts={related} />

      <MobileTableOfContents headings={headings} label={t('on_this_page')} />
    </>
  );
}
