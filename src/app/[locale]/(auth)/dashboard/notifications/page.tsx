import { auth } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { NotificationList } from '@/components/notifications/notification-list';
import { listNotifications, markAllRead } from '@/libs/Notification';
import { getI18nPath } from '@/utils/Helpers';

type DashboardNotificationsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardNotificationsPage(props: DashboardNotificationsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const { userId } = await auth();

  if (!userId) {
    redirect(getI18nPath('/sign-in', locale));
  }

  const t = await getTranslations({ locale, namespace: 'DashboardNotificationsPage' });

  // List first so this render keeps the unread highlight, then clear so the badge resets.
  const notifications = await listNotifications({ userId, limit: 50 });
  await markAllRead({ userId });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold tracking-tight">{t('title')}</h1>
      <NotificationList notifications={notifications} locale={locale} />
    </div>
  );
}
