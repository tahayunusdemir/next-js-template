import { currentUser } from '@clerk/nextjs/server';
import { ExternalLinkIcon, PencilIcon, UsersIcon } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { ProfileView } from '@/components/profile/profile-view';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';
import { ensureProfile } from '@/libs/Profile';
import { getI18nPath } from '@/utils/Helpers';

export default async function DashboardProfilePage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();

  if (!user) {
    redirect(getI18nPath('/sign-in', locale));
  }

  const profile = await ensureProfile(user);

  if (!profile) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'ProfilePage' });

  const actions = (
    <div className="flex flex-wrap gap-2">
      <Link href="/dashboard/settings/" className={cn(buttonVariants({ variant: 'outline' }))}>
        <PencilIcon />
        {t('edit_profile')}
      </Link>
      <Link
        href="/dashboard/profile/connections/"
        className={cn(buttonVariants({ variant: 'outline' }))}
      >
        <UsersIcon />
        {t('connections')}
      </Link>
      <Link href={`/u/${profile.handle}`} className={cn(buttonVariants({ variant: 'ghost' }))}>
        <ExternalLinkIcon />
        {t('view_public')}
      </Link>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <ProfileView profile={profile} locale={locale} actions={actions} linkCollections />
    </div>
  );
}
