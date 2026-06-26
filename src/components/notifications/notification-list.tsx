'use client';

import { useTranslations } from 'next-intl';
import { markReadAction } from '@/app/[locale]/(auth)/dashboard/notifications/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';
import type { NotificationItem } from '@/libs/Notification';
import { getInitials } from '@/utils/Helpers';
import { formatRelativeTime } from '@/utils/Time';

function NotificationRow(props: {
  notification: NotificationItem;
  locale: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations('DashboardNotificationsPage');
  const { notification } = props;
  const name = notification.actor.displayName ?? notification.actor.handle;

  return (
    <Link
      href={notification.href}
      onClick={() => {
        if (!notification.isRead) {
          // Fire-and-forget: clearing the unread state must not block navigation.
          void markReadAction(notification.id);
        }
        props.onNavigate?.();
      }}
      className={cn(
        'flex items-start gap-2.5 rounded-lg px-2.5 py-2.5 ring-inset transition-colors hover:bg-muted/75',
        notification.isRead ? '' : 'bg-muted/40',
      )}
    >
      <Avatar className="size-8 shrink-0">
        {notification.actor.avatarUrl ? (
          <AvatarImage src={notification.actor.avatarUrl} alt={name} />
        ) : null}
        <AvatarFallback className="text-xs text-foreground">{getInitials(name)}</AvatarFallback>
      </Avatar>

      <div className="w-0 flex-1 overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 min-w-0 flex-1 text-sm leading-5">
            <span className="font-medium">{name}</span>{' '}
            <span className="text-muted-foreground">{t(`action_${notification.type}`)}</span>
          </p>
          <span className="shrink-0 text-xs leading-5 text-nowrap text-muted-foreground">
            {formatRelativeTime(notification.createdAt, props.locale)}
          </span>
        </div>
        {notification.postTitle ? (
          <p className="truncate text-xs leading-4 text-muted-foreground">
            {notification.postTitle}
          </p>
        ) : null}
      </div>

      {notification.isRead ? null : (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
      )}
    </Link>
  );
}

export function NotificationList(props: {
  notifications: NotificationItem[];
  locale: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const t = useTranslations('DashboardNotificationsPage');

  if (props.notifications.length === 0) {
    return <p className="px-2.5 py-6 text-sm text-muted-foreground">{t('empty')}</p>;
  }

  return (
    <div className={cn('flex flex-col gap-1', props.className)}>
      {props.notifications.map((notification) => (
        <NotificationRow
          key={notification.id}
          notification={notification}
          locale={props.locale}
          onNavigate={props.onNavigate}
        />
      ))}
    </div>
  );
}
