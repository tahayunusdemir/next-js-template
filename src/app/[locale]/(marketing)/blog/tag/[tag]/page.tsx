import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { BlogCard } from '@/components/blog/blog-card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAllPosts, getAllTags } from '@/libs/Blog';
import type { BlogTag } from '@/libs/Blog';
import { Link } from '@/libs/I18nNavigation';
import { getI18nPath } from '@/utils/Helpers';

type BlogTagPageProps = {
  params: Promise<{ locale: string; tag: string }>;
};

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

function resolveTag(value: string): BlogTag | null {
  return getAllTags().find((tag) => tag === value) ?? null;
}

export async function generateMetadata(props: BlogTagPageProps): Promise<Metadata> {
  const { locale, tag } = await props.params;
  const resolved = resolveTag(tag);

  if (!resolved) {
    return {};
  }

  const tBlog = await getTranslations({ locale, namespace: 'Blog' });
  const title = tBlog('posts_tagged', { tag: tBlog(`tag_${resolved}`) });

  return {
    title,
    alternates: { canonical: getI18nPath(`/blog/tag/${resolved}`, locale) },
    openGraph: { title, type: 'website' },
  };
}

export default async function BlogTagPage(props: BlogTagPageProps) {
  const { locale, tag } = await props.params;
  setRequestLocale(locale);

  const resolved = resolveTag(tag);

  if (!resolved) {
    notFound();
  }

  const tBlog = await getTranslations({ locale, namespace: 'Blog' });
  const posts = getAllPosts(locale, { tag: resolved });

  return (
    <>
      <div className="relative border-b border-dashed">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] [mask-image:linear-gradient(to_bottom,black,transparent)] [background-size:18px_18px] opacity-50"
        />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Link
            href="/blog/tags"
            className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'rounded-full')}
            aria-label={tBlog('browse_tags')}
          >
            <ArrowLeftIcon className="size-4" />
          </Link>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {tBlog('posts_tagged', { tag: tBlog(`tag_${resolved}`) })}
          </h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </>
  );
}
