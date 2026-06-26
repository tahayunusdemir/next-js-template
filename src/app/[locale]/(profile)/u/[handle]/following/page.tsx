import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ConnectionList } from '@/components/profile/connection-list';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';
import { getProfileByHandle } from '@/libs/Profile';
import { listFollowing } from '@/libs/Social';

type FollowingPageProps = {
  params: Promise<{ locale: string; handle: string }>;
};

export async function generateMetadata(props: FollowingPageProps): Promise<Metadata> {
  const { locale, handle } = await props.params;
  const profile = await getProfileByHandle(handle);

  if (!profile || !profile.isPublic) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'ProfilePage' });

  return { title: t('following_title') };
}

export default async function FollowingPage(props: FollowingPageProps) {
  const { locale, handle } = await props.params;
  setRequestLocale(locale);

  const profile = await getProfileByHandle(handle);

  if (!profile || !profile.isPublic) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'ProfilePage' });
  const following = await listFollowing({ userId: profile.id });
  const name = profile.displayName?.trim() ? profile.displayName : `@${profile.handle}`;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-16">
      <div className="mb-6 flex flex-col gap-1">
        <Link
          href={`/u/${profile.handle}`}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 w-fit')}
        >
          <ArrowLeftIcon />
          {name}
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">{t('following_title')}</h1>
      </div>
      <ConnectionList items={following} locale={locale} emptyMessage={t('empty_following')} />
    </div>
  );
}
