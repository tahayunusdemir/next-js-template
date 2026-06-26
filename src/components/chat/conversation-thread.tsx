'use client';

import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  ArrowLeftIcon,
  MoreHorizontalIcon,
  UserRoundIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment, useEffect, useRef } from 'react';
import { setArchivedAction } from '@/app/[locale]/(auth)/dashboard/messages/actions';
import { MessageComposer } from '@/components/chat/message-composer';
import { useChatAction } from '@/components/chat/use-chat-action';
import { useConversationRealtime } from '@/components/chat/use-conversation-realtime';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ConversationDetail } from '@/libs/Chat';
import { Link } from '@/libs/I18nNavigation';
import { getInitials } from '@/utils/Helpers';

// Formats a message timestamp as a short, locale-aware clock time.
function formatClock(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date);
}

// Calendar-day key in local time, used to detect day boundaries between messages.
function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// Labels a day divider as today/yesterday, falling back to a locale-aware date that
// drops the year while it matches the current one.
function dayLabel(
  date: Date,
  locale: string,
  t: ReturnType<typeof useTranslations<'DashboardMessagesPage'>>,
) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (dayKey(date) === dayKey(now)) {
    return t('group_today');
  }

  if (dayKey(date) === dayKey(yesterday)) {
    return t('group_yesterday');
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  }).format(date);
}

export function ConversationThread(props: {
  detail: ConversationDetail;
  currentUserId: string;
  locale: string;
  backHref: string;
  showBackButton: boolean;
  onOpenContact: () => void;
  className?: string;
}) {
  const t = useTranslations('DashboardMessagesPage');
  const { router } = useChatAction();
  const name = props.detail.participant.displayName ?? props.detail.participant.handle;
  const isBlocked = props.detail.relationship.isBlocked || props.detail.relationship.isBlockedBy;
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageId = props.detail.messages.at(-1)?.id;

  // Pin the thread to the newest message when it opens and after each new message arrives.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [lastMessageId, props.detail.id]);

  useConversationRealtime({
    conversationId: props.detail.id,
    onMessage: () => {
      router.refresh();
    },
  });

  async function toggleArchive() {
    const result = await setArchivedAction({
      conversationId: props.detail.id,
      archived: !props.detail.isArchived,
    });

    if (result.ok) {
      router.refresh();
    }
  }

  return (
    <div className={cn('flex h-full flex-col py-3', props.className)}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 px-3">
          <div className="flex items-center gap-3">
            {props.showBackButton ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label={t('back')}
                render={<Link href={props.backHref} />}
              >
                <ArrowLeftIcon />
              </Button>
            ) : null}
            <Avatar className="size-8">
              {props.detail.participant.avatarUrl ? (
                <AvatarImage src={props.detail.participant.avatarUrl} alt={name} />
              ) : null}
              <AvatarFallback className="bg-background text-foreground">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">{name}</div>
              <div className="text-xs leading-3 text-muted-foreground">
                @{props.detail.participant.handle}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t('view_profile')}
              onClick={props.onOpenContact}
            >
              <UserRoundIcon />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-sm" aria-label={t('more_actions')} />}
              >
                <MoreHorizontalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    void toggleArchive();
                  }}
                >
                  {props.detail.isArchived ? <ArchiveRestoreIcon /> : <ArchiveIcon />}
                  {props.detail.isArchived ? t('unarchive') : t('archive')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator />
      </div>

      <ScrollArea className="min-h-0 flex-1 [&_[data-orientation=vertical][data-slot=scroll-area-scrollbar]]:w-1.5">
        <div className="flex flex-col gap-6 px-3 py-8">
          {props.detail.messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">{t('thread_empty')}</p>
          ) : (
            props.detail.messages.map((message, index) => {
              const isOutbound = message.senderId === props.currentUserId;
              const senderName = isOutbound ? t('you') : name;
              const previous = props.detail.messages[index - 1];
              const showDayDivider =
                !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt);

              return (
                <Fragment key={message.id}>
                  {showDayDivider ? (
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-border" />
                      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                        {dayLabel(message.createdAt, props.locale, t)}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  ) : null}

                  <div className={cn('flex items-end gap-2', isOutbound && 'flex-row-reverse')}>
                    <Avatar className="shrink-0">
                      {!isOutbound && props.detail.participant.avatarUrl ? (
                        <AvatarImage src={props.detail.participant.avatarUrl} alt={senderName} />
                      ) : null}
                      <AvatarFallback
                        className={cn(
                          'bg-muted text-foreground text-xs',
                          isOutbound && 'bg-primary text-primary-foreground',
                        )}
                      >
                        {getInitials(senderName)}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={cn(
                        'flex max-w-[75%] flex-col gap-2 rounded-xl px-4 py-3 text-sm md:max-w-md lg:max-w-lg',
                        isOutbound ? 'bg-primary text-primary-foreground' : 'bg-muted',
                      )}
                    >
                      <p className="leading-relaxed break-words whitespace-pre-wrap">
                        {message.body}
                      </p>
                      <div
                        className={cn(
                          'text-muted-foreground/75 text-xs',
                          isOutbound && 'text-right text-primary-foreground/75',
                        )}
                      >
                        {formatClock(message.createdAt, props.locale)}
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="px-3">
        <MessageComposer conversationId={props.detail.id} disabled={isBlocked} />
      </div>
    </div>
  );
}
