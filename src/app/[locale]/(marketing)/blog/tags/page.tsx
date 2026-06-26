import { ArrowRightIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAllTags, getTagCount } from '@/libs/Blog';
import { Link } from '@/libs/I18nNavigation';
import { getI18nPath } from '@/utils/Helpers';

type BlogTagsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: BlogTagsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'BlogPage' });

  return {
    title: t('tags_meta_title'),
    description: t('tags_meta_description'),
    alternates: { canonical: getI18nPath('/blog/tags', locale) },
    openGraph: {
      title: t('tags_meta_title'),
      description: t('tags_meta_description'),
      type: 'website',
    },
  };
}

export default async function BlogTagsPage(props: BlogTagsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'BlogPage' });
  const tBlog = await getTranslations({ locale, namespace: 'Blog' });
  const tags = getAllTags();

  return (
    <>
      <div className="relative border-b border-dashed">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] [mask-image:linear-gradient(to_bottom,black,transparent)] [background-size:18px_18px] opacity-50"
        />
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {t('tags_title')}
            </h1>
            <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">
              {t('tags_subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${tag}`}
              className="group flex items-center justify-between rounded-xl border bg-card p-5 ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex items-center gap-3">
                <span className="font-heading text-lg font-semibold tracking-tight">
                  {tBlog(`tag_${tag}`)}
                </span>
                <span className="flex h-6 min-w-6 items-center justify-center rounded-md border px-1.5 text-xs font-medium text-muted-foreground">
                  {getTagCount(tag)}
                </span>
              </span>
              <ArrowRightIcon
                aria-hidden
                className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1"
              />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
