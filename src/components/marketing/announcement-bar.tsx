'use client';

import { ArrowRightIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'announcement-dismissed-v1';
const CHANGE_EVENT = 'announcement-change';

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

// Reads the dismissed flag from localStorage without a layout effect.
function useDismissed() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(STORAGE_KEY) === '1',
    () => false,
  );
}

export function AnnouncementBar() {
  const t = useTranslations('AnnouncementBar');
  const dismissed = useDismissed();

  if (dismissed) {
    return null;
  }

  return (
    <div className="bg-foreground text-background">
      <div className="relative mx-auto flex max-w-6xl items-center justify-center gap-3 px-10 py-2 sm:px-6 lg:px-8">
        <a
          href="#features"
          className="group inline-flex items-center gap-2 text-center text-xs font-medium sm:text-sm"
        >
          <span className="size-1.5 shrink-0 rounded-full bg-background" />
          {t('message')}
          <span className="hidden items-center gap-1 underline-offset-2 group-hover:underline sm:inline-flex">
            {t('cta')}
            <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </a>
        <button
          type="button"
          aria-label={t('dismiss')}
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, '1');
            window.dispatchEvent(new Event(CHANGE_EVENT));
          }}
          className={cn(
            'absolute right-3 flex size-6 items-center justify-center rounded-md text-background/70 transition-colors hover:bg-background/10 hover:text-background',
          )}
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
