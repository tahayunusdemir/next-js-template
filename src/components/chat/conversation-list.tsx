'use client';

import { FilterIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ConversationSummary } from '@/libs/Chat';
import { Link } from '@/libs/I18nNavigation';
import type { ChatFilter, ChatGroup } from '@/types/Chat';
import { CHAT_FILTERS, CHAT_GROUPS } from '@/types/Chat';
import { getInitials } from '@/utils/Helpers';
import { formatRelativeTime } from '@/utils/Time';

// Builds the messages href for a given filter, keeping the active selection where it makes
// sense. Filter links drop the open thread; conversation links keep the active filter.
function buildHref(props: { conversationId?: string; filter: ChatFilter }) {
  const params = new URLSearchParams();

  if (props.conversationId) {
    params.set('c', props.conversationId);
  }

  if (props.filter !== 'all') {
    params.set('filter', props.filter);
  }

  const query = params.toString();

  return query ? `/dashboard/messages?${query}` : '/dashboard/messages';
}

function ConversationGroup(props: {
  group: ChatGroup;
  conversations: ConversationSummary[];
  filter: ChatFilter;
  selectedId: string | null;
  locale: string;
}) {
  const t = useTranslations('DashboardMessagesPage');

  return (
    <div>
      <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
        {t(`group_${props.group}`)}
      </div>
      <div className="flex flex-col gap-1 px-2">
        {props.conversations.map((conversation) => {
          const isSelected = props.selectedId === conversation.id;
          const name = conversation.participant.displayName ?? conversation.participant.handle;

          return (
            <Link
              key={conversation.id}
              href={buildHref({ conversationId: conversation.id, filter: props.filter })}
              className={cn(
                'w-full overflow-hidden rounded-lg px-2.5 py-2.5 text-left ring-inset transition-colors',
                isSelected ? 'bg-muted ring-1 ring-border' : 'hover:bg-muted/75',
              )}
            >
              <div className="flex min-w-0 items-start gap-2.5">
                <Avatar className="shrink-0">
                  {conversation.participant.avatarUrl ? (
                    <AvatarImage src={conversation.participant.avatarUrl} alt={name} />
                  ) : null}
                  <AvatarFallback className="text-xs text-foreground">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>

                <div className="w-0 flex-1 overflow-hidden">
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="truncate text-sm leading-5 font-medium">{name}</div>
                    <span className="text-xs leading-5 text-nowrap text-muted-foreground">
                      {formatRelativeTime(conversation.lastMessageAt, props.locale)}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-end gap-2">
                    <div className="w-0 flex-1 overflow-hidden">
                      <div
                        className={cn(
                          'truncate text-xs leading-4',
                          conversation.unreadCount > 0
                            ? 'font-medium text-foreground/90'
                            : 'text-muted-foreground',
                        )}
                      >
                        {conversation.lastMessagePreview
                          ? (conversation.lastMessageFromMe ? `${t('you_prefix')} ` : '') +
                            conversation.lastMessagePreview
                          : t('no_messages_yet')}
                      </div>
                    </div>

                    {conversation.unreadCount > 0 ? (
                      <div className="grid size-5 place-items-center rounded-full bg-primary/90 text-xs text-primary-foreground">
                        {conversation.unreadCount}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ConversationList(props: {
  conversations: ConversationSummary[];
  filter: ChatFilter;
  selectedId: string | null;
  locale: string;
  className?: string;
}) {
  const t = useTranslations('DashboardMessagesPage');

  const grouped = CHAT_GROUPS.map((group) => ({
    group,
    conversations: props.conversations.filter((conversation) => conversation.group === group),
  })).filter((entry) => entry.conversations.length > 0);

  return (
    <div className={cn('flex h-full flex-col gap-3 py-3', props.className)}>
      <div className="flex items-center justify-between gap-4 px-3 py-0.5">
        <h1 className="text-xl leading-none font-medium">{t('inbox')}</h1>
        <FilterIcon className="size-4 text-muted-foreground" />
      </div>

      <Separator />

      <div className="flex items-center gap-1 px-3">
        {CHAT_FILTERS.map((filter) => (
          <Link
            key={filter}
            href={buildHref({ filter })}
            className={cn(
              'rounded-md px-2.5 py-1 font-medium text-sm transition-colors',
              props.filter === filter
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t(`filter_${filter}`)}
          </Link>
        ))}
      </div>

      <Separator />

      <div className="flex min-h-0 flex-1 flex-col">
        {grouped.length === 0 ? (
          <p className="px-3 py-6 text-sm text-muted-foreground">{t(`empty_${props.filter}`)}</p>
        ) : (
          <ScrollArea className="h-full min-h-0 flex-1 overflow-hidden [&_[data-orientation=vertical][data-slot=scroll-area-scrollbar]]:w-1.5">
            <div className="flex flex-col gap-3 pt-0">
              {grouped.map(({ group, conversations }) => (
                <ConversationGroup
                  key={group}
                  group={group}
                  conversations={conversations}
                  filter={props.filter}
                  selectedId={props.selectedId}
                  locale={props.locale}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
