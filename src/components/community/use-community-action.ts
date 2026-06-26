'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useCommunityMode } from '@/components/community/community-mode';
import { useRouter } from '@/libs/I18nNavigation';

// Bundles the `CommunityPage` translations, the locale-aware router, the active mode, and the
// shared handlers every action island repeats. `guard` blocks writes on the read-only public
// feed (toasting a prompt to the dashboard); `onFailure` maps a server reason to a toast —
// anonymous callers are sent to sign-in, anything else surfaces a generic error.
export function useCommunityAction() {
  const t = useTranslations('CommunityPage');
  const router = useRouter();
  const { interactive, basePath } = useCommunityMode();

  // True when the caller may proceed. On the read-only public feed it instead toasts a prompt
  // and routes to the dashboard, so write islands can bail before mutating.
  function guard() {
    if (interactive) {
      return true;
    }

    toast.info(t('dashboard_required'));
    router.push('/dashboard/community');
    return false;
  }

  function onFailure(reason: 'auth' | 'invalid' | 'forbidden') {
    if (reason === 'auth') {
      toast.error(t('sign_in_required'));
      router.push('/sign-in');
    } else {
      toast.error(t('action_error'));
    }
  }

  return { t, router, interactive, basePath, guard, onFailure };
}
