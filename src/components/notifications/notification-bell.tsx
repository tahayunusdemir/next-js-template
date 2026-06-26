import { auth } from '@clerk/nextjs/server';
import { NotificationMenu } from '@/components/notifications/notification-menu';
import { getUnreadCount, listNotifications } from '@/libs/Notification';

// Server wrapper for the header bell: loads the recent notifications and unread count once
// per dashboard render, then hands them to the interactive menu. Renders nothing for an
// anonymous request (the dashboard is already auth-gated, this is just defensive).
export async function NotificationBell(props: { locale: string }) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const [notifications, unreadCount] = await Promise.all([
    listNotifications({ userId, limit: 8 }),
    getUnreadCount({ userId }),
  ]);

  return (
    <NotificationMenu
      notifications={notifications}
      unreadCount={unreadCount}
      locale={props.locale}
    />
  );
}
