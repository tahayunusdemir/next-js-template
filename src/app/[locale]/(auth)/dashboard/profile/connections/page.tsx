import { currentUser } from '@clerk/nextjs/server';
import { ArrowLeftIcon } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ConnectionList } from '@/components/profile/connection-list';
import { FollowButton } from '@/components/profile/follow-button';
import { buttonVariants } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';
import { ensureProfile } from '@/libs/Profile';
import { listBlocked, listFollowers, listFollowing } from '@/libs/Social';
import { getI18nPath } from '@/utils/Helpers';

const TABS = ['following', 'followers', 'blocked'] as const;

type ConnectionsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function ConnectionsPage(props: ConnectionsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();

  if (!user) {
    redirect(getI18nPath('/sign-in', locale));
  }

  await ensureProfile(user);
  const t = await getTranslations({ locale, namespace: 'ConnectionsPage' });

  const { tab } = await props.searchParams;
  const active = TABS.find((value) => value === tab) ?? 'following';

  const [following, followers, blocked] = await Promise.all([
    listFollowing({ userId: user.id }),
    listFollowers({ userId: user.id }),
    listBlocked({ userId: user.id }),
  ]);

  const followingIds = new Set(following.map((connection) => connection.id));

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard/profile/"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 w-fit')}
        >
          <ArrowLeftIcon />
          {t('back_to_profile')}
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Tabs defaultValue={active} className="gap-6">
        <TabsList>
          <TabsTrigger value="following">
            {t('tab_following')}
            <span className="text-muted-foreground">{following.length}</span>
          </TabsTrigger>
          <TabsTrigger value="followers">
            {t('tab_followers')}
            <span className="text-muted-foreground">{followers.length}</span>
          </TabsTrigger>
          <TabsTrigger value="blocked">
            {t('tab_blocked')}
            <span className="text-muted-foreground">{blocked.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="following">
          <ConnectionList
            items={following}
            locale={locale}
            emptyMessage={t('empty_following')}
            renderActions={(connection) => (
              <FollowButton
                size="sm"
                targetId={connection.id}
                initial={{ isFollowing: true, isBlocked: false }}
              />
            )}
          />
        </TabsContent>

        <TabsContent value="followers">
          <ConnectionList
            items={followers}
            locale={locale}
            emptyMessage={t('empty_followers')}
            renderActions={(connection) => (
              <FollowButton
                size="sm"
                targetId={connection.id}
                initial={{ isFollowing: followingIds.has(connection.id), isBlocked: false }}
              />
            )}
          />
        </TabsContent>

        <TabsContent value="blocked">
          <ConnectionList
            items={blocked}
            locale={locale}
            emptyMessage={t('empty_blocked')}
            renderActions={(connection) => (
              <FollowButton
                size="sm"
                targetId={connection.id}
                initial={{ isFollowing: false, isBlocked: true }}
              />
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
