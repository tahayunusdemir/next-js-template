'use client';

import { MessageCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { startConversationAction } from '@/app/[locale]/(auth)/dashboard/messages/actions';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/libs/I18nNavigation';

// Entry point to direct messages from a public profile: opens (or reuses) the 1:1 thread
// with the target and routes to it. Anonymous viewers are sent to sign-in.
export function MessageButton(props: {
  targetId: string;
  signedIn: boolean;
  size?: 'default' | 'sm';
}) {
  const t = useTranslations('DashboardMessagesPage');
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function open() {
    if (!props.signedIn) {
      toast.error(t('sign_in_required'));
      router.push('/sign-in');
      return;
    }

    startTransition(async () => {
      const result = await startConversationAction({ targetId: props.targetId });

      if (result.ok) {
        router.push(`/dashboard/messages?c=${result.conversationId}`);
      } else if (result.reason === 'auth') {
        toast.error(t('sign_in_required'));
        router.push('/sign-in');
      } else {
        toast.error(t('action_error'));
      }
    });
  }

  return (
    <Button variant="outline" size={props.size ?? 'default'} disabled={pending} onClick={open}>
      <MessageCircleIcon />
      {t('message')}
    </Button>
  );
}
