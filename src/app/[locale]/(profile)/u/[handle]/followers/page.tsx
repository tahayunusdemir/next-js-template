import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ConnectionList } from '@/components/profile/connection-list';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';
import { getProfileByHandle } from '@/libs/Profile';
import { listFollowers } from '@/libs/Social';

type FollowersPageProps = {
  params: Promise<{ locale: string; handle: string }>;
};

export async function generateMetadata(props: FollowersPageProps): Promise<Metadata> {
  const { locale, handle } = await props.params;
  const profile = await getProfileByHandle(handle);

  if (!profile || !profile.isPublic) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'ProfilePage' });

  return { title: t('followers_title') };
}

export default async function FollowersPage(props: FollowersPageProps) {
  const { locale, handle } = await props.params;
  setRequestLocale(locale);

  const profile = await getProfileByHandle(handle);

  if (!profile || !profile.isPublic) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'ProfilePage' });
  const followers = await listFollowers({ userId: profile.id });
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
        <h1 className="text-xl font-semibold tracking-tight">{t('followers_title')}</h1>
      </div>
      <ConnectionList items={followers} locale={locale} emptyMessage={t('empty_followers')} />
    </div>
  );
}
