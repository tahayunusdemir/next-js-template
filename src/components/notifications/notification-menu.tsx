'use client';

import { BellIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { markAllReadAction } from '@/app/[locale]/(auth)/dashboard/notifications/actions';
import { NotificationList } from '@/components/notifications/notification-list';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Link, useRouter } from '@/libs/I18nNavigation';
import type { NotificationItem } from '@/libs/Notification';

export function NotificationMenu(props: {
  notifications: NotificationItem[];
  unreadCount: number;
  locale: string;
}) {
  const t = useTranslations('DashboardNotificationsPage');
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function handleMarkAllRead() {
    startTransition(async () => {
      const result = await markAllReadAction();

      if (result.ok) {
        router.refresh();
      } else {
        toast.error(t('action_error'));
      }
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label={t('title')}>
            <BellIcon />
            {props.unreadCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4 font-medium text-primary-foreground">
                {props.unreadCount > 9 ? '9+' : props.unreadCount}
              </span>
            ) : null}
          </Button>
        }
      />
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between gap-2 px-2.5 py-2">
          <span className="text-sm font-medium">{t('title')}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-1.5 py-0.5 text-xs font-normal text-muted-foreground"
            disabled={pending || props.unreadCount === 0}
            onClick={handleMarkAllRead}
          >
            {t('mark_all_read')}
          </Button>
        </div>

        <Separator />

        <div className="max-h-96 overflow-y-auto p-1.5">
          <NotificationList
            notifications={props.notifications}
            locale={props.locale}
            onNavigate={() => {
              setOpen(false);
            }}
          />
        </div>

        <Separator />

        <div className="p-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full font-normal"
            nativeButton={false}
            render={
              <Link
                href="/dashboard/notifications/"
                onClick={() => {
                  setOpen(false);
                }}
              />
            }
          >
            {t('see_all')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
