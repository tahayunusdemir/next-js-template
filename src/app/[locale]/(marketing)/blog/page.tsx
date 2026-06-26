import { TagsIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { BlogCard } from '@/components/blog/blog-card';
import { BlogSearch } from '@/components/blog/blog-search';
import { BlogListStructuredData } from '@/components/blog/blog-structured-data';
import { TagFilter } from '@/components/blog/tag-filter';
import type { TagOption } from '@/components/blog/tag-filter';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAllPosts, getAllTags, getTagCount } from '@/libs/Blog';
import type { BlogTag } from '@/libs/Blog';
import { Link } from '@/libs/I18nNavigation';
import { getBaseUrl, getI18nPath } from '@/utils/Helpers';

type BlogIndexPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string; q?: string }>;
};

export async function generateMetadata(props: BlogIndexPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'BlogPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    openGraph: { title: t('meta_title'), description: t('meta_description'), type: 'website' },
    alternates: {
      canonical: getI18nPath('/blog', locale),
      types: {
        'application/rss+xml': `${getBaseUrl()}${getI18nPath('/blog/rss.xml', locale)}`,
      },
    },
  };
}

function isBlogTag(value: string | undefined, tags: BlogTag[]): value is BlogTag {
  return value !== undefined && tags.some((tag) => tag === value);
}

export default async function BlogIndexPage(props: BlogIndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const { tag, q } = await props.searchParams;
  const t = await getTranslations({ locale, namespace: 'BlogPage' });
  const tBlog = await getTranslations({ locale, namespace: 'Blog' });

  const tags = getAllTags();
  const activeTag = isBlogTag(tag, tags) ? tag : undefined;
  const hasQuery = Boolean(q?.trim());
  const posts = getAllPosts(locale, { tag: activeTag, query: q });

  const options: TagOption[] = [
    { value: 'all', label: tBlog('all'), count: getTagCount() },
    ...tags.map((value) => ({
      value,
      label: tBlog(`tag_${value}`),
      count: getTagCount(value),
    })),
  ];

  return (
    <>
      <BlogListStructuredData
        locale={locale}
        title={t('meta_title')}
        description={t('meta_description')}
      />

      <div className="relative border-b border-dashed">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] [mask-image:linear-gradient(to_bottom,black,transparent)] [background-size:18px_18px] opacity-50"
        />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Suspense fallback={<div className="h-10 max-w-sm" />}>
              <BlogSearch />
            </Suspense>
            <Link
              href="/blog/tags"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'gap-2 rounded-full',
              )}
            >
              <TagsIcon className="size-4" />
              {tBlog('browse_tags')}
            </Link>
          </div>
          <TagFilter
            options={options}
            selected={activeTag ?? 'all'}
            categoryLabel={tBlog('select_category')}
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {posts.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            {hasQuery ? tBlog('search_empty') : t('empty')}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
