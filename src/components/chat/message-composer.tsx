'use client';

import { SendIcon } from 'lucide-react';
import * as React from 'react';
import { sendMessageAction } from '@/app/[locale]/(auth)/dashboard/messages/actions';
import { useChatAction } from '@/components/chat/use-chat-action';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MESSAGE_BODY_MAX } from '@/validations/ChatValidation';

// Reply box for the open thread. Sends through the server action and refreshes the thread
// from the server on success; `disabled` covers a blocked relationship.
export function MessageComposer(props: { conversationId: string; disabled?: boolean }) {
  const { t, router, onFailure } = useChatAction();
  const [body, setBody] = React.useState('');
  const [pending, setPending] = React.useState(false);

  async function submit() {
    const trimmed = body.trim();

    if (trimmed.length === 0 || props.disabled) {
      return;
    }

    setPending(true);
    const result = await sendMessageAction({ conversationId: props.conversationId, body: trimmed });
    setPending(false);

    if (result.ok) {
      setBody('');
      router.refresh();
    } else {
      onFailure(result.reason);
    }
  }

  if (props.disabled) {
    return (
      <div className="rounded-md border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
        {t('blocked_notice')}
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-md border px-3 py-2"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <Textarea
        aria-label={t('composer_placeholder')}
        placeholder={t('composer_placeholder')}
        required
        maxLength={MESSAGE_BODY_MAX}
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void submit();
          }
        }}
        className="min-h-10 resize-none border-0 px-0 py-0.5 text-sm shadow-none focus-visible:ring-0"
      />
      <div className="flex items-center justify-end">
        <Button type="submit" size="icon-sm" disabled={pending || body.trim().length === 0}>
          <SendIcon />
        </Button>
      </div>
    </form>
  );
}
