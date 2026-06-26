'use client';

import { MessageSquareIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { ConversationList } from '@/components/chat/conversation-list';
import { ConversationThread } from '@/components/chat/conversation-thread';
import { ParticipantDetails } from '@/components/chat/participant-details';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { useIsLg } from '@/hooks/use-lg';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { ConversationDetail, ConversationSummary } from '@/libs/Chat';
import type { ChatFilter } from '@/types/Chat';

// Three-pane messages layout (list | thread | profile), driven by the URL: the open thread
// comes from `?c=`, the inbox filter from `?filter=`. Mirrors the admin template's responsive
// behavior — list and thread swap on mobile, the profile panel slides in on lg and is a sheet
// below it — but selection lives in the URL instead of a client store.
export function ChatShell(props: {
  conversations: ConversationSummary[];
  detail: ConversationDetail | null;
  filter: ChatFilter;
  currentUserId: string;
  locale: string;
}) {
  const t = useTranslations('DashboardMessagesPage');
  const [showContact, setShowContact] = useState(false);
  const isLg = useIsLg();
  const isMobile = useIsMobile();

  const backHref =
    props.filter === 'all' ? '/dashboard/messages' : `/dashboard/messages?filter=${props.filter}`;
  const showThread = Boolean(props.detail);

  return (
    <>
      <div
        className="grid min-h-0 min-w-0 flex-1 grid-cols-1 overflow-hidden transition-[grid-template-columns] duration-300 ease-out *:min-h-0 *:min-w-0 md:grid-cols-[22.5rem_minmax(0,1fr)] md:rounded-b-xl md:*:first:border-r lg:grid-cols-[22.5rem_minmax(0,1fr)_var(--profile-width)]"
        style={{ '--profile-width': showContact ? '20rem' : '0rem' } as CSSProperties}
      >
        <ConversationList
          conversations={props.conversations}
          filter={props.filter}
          selectedId={props.detail?.id ?? null}
          locale={props.locale}
          className={cn(
            'transition-transform duration-300 ease-out will-change-transform max-md:col-start-1 max-md:row-start-1',
            showThread && 'max-md:pointer-events-none max-md:-translate-x-full',
          )}
        />

        {props.detail ? (
          <ConversationThread
            detail={props.detail}
            currentUserId={props.currentUserId}
            locale={props.locale}
            backHref={backHref}
            showBackButton={isMobile}
            onOpenContact={() => {
              setShowContact(true);
            }}
            className={cn(
              'transition-transform duration-300 ease-out will-change-transform max-md:col-start-1 max-md:row-start-1',
              showThread
                ? 'max-md:translate-x-0'
                : 'max-md:pointer-events-none max-md:translate-x-full',
            )}
          />
        ) : (
          <div className="hidden place-items-center text-center md:grid">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <MessageSquareIcon className="size-8" />
              <p className="text-sm">{t('select_conversation')}</p>
            </div>
          </div>
        )}

        <div
          aria-hidden={!showContact}
          className={cn(
            'hidden overflow-hidden border-l transition-colors duration-300 lg:block',
            !showContact && 'pointer-events-none border-l-transparent',
          )}
        >
          {props.detail ? (
            <div
              className={cn(
                'h-full w-80 transition-[opacity,transform] duration-300 ease-out',
                showContact ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
              )}
            >
              <ParticipantDetails
                participant={props.detail.participant}
                relationship={props.detail.relationship}
                onClose={() => {
                  setShowContact(false);
                }}
              />
            </div>
          ) : null}
        </div>
      </div>

      {!isLg && props.detail ? (
        <Sheet open={showContact} onOpenChange={setShowContact}>
          <SheetContent side="right" className="w-80 p-0">
            <SheetTitle className="sr-only">{props.detail.participant.handle}</SheetTitle>
            <SheetDescription className="sr-only" />
            <ParticipantDetails
              participant={props.detail.participant}
              relationship={props.detail.relationship}
              onClose={() => {
                setShowContact(false);
              }}
            />
          </SheetContent>
        </Sheet>
      ) : null}
    </>
  );
}
