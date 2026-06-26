'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { ChatActionReason } from '@/app/[locale]/(auth)/dashboard/messages/actions';
import { useRouter } from '@/libs/I18nNavigation';

// Bundles the `DashboardMessagesPage` translations, the locale-aware router, and the shared
// failure handler every chat island repeats: an anonymous caller is sent to sign-in, anything
// else surfaces a generic error toast.
export function useChatAction() {
  const t = useTranslations('DashboardMessagesPage');
  const router = useRouter();

  function onFailure(reason: ChatActionReason) {
    if (reason === 'auth') {
      toast.error(t('sign_in_required'));
      router.push('/sign-in');
    } else {
      toast.error(t('action_error'));
    }
  }

  return { t, router, onFailure };
}
