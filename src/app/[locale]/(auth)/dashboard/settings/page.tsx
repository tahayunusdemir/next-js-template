import { UserProfile } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { ExternalLinkIcon } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { buttonVariants } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';
import { ensureProfile } from '@/libs/Profile';
import { getI18nPath } from '@/utils/Helpers';

export default async function SettingsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();

  if (!user) {
    redirect(getI18nPath('/sign-in', locale));
  }

  const profile = await ensureProfile(user);
  const t = await getTranslations({ locale, namespace: 'ProfileSettingsPage' });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        {profile ? (
          <Link
            href={`/u/${profile.handle}`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          >
            {t('view_public')}
            <ExternalLinkIcon />
          </Link>
        ) : null}
      </div>

      <Tabs defaultValue="profile" className="gap-6">
        <TabsList>
          <TabsTrigger value="profile">{t('tab_profile')}</TabsTrigger>
          <TabsTrigger value="account">{t('tab_account')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <EditProfileForm
            defaults={{
              firstName: user.firstName ?? '',
              lastName: user.lastName ?? '',
              username: user.username ?? '',
              bio: profile?.bio ?? '',
              country: profile?.country ?? '',
              website: profile?.website ?? '',
            }}
          />
        </TabsContent>

        <TabsContent value="account">
          <UserProfile
            routing="hash"
            appearance={{
              elements: {
                rootBox: 'w-full',
                cardBox: 'w-full max-w-none border-none shadow-none',
              },
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
