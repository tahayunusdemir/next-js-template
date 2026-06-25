'use client';

import { ArrowUpIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => {
    window.removeEventListener('scroll', onChange);
  };
}

// Shows the button once the page is scrolled past ~600px, without a layout effect.
function useScrolledFar() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.scrollY > 600,
    () => false,
  );
}

export function ScrollToTop() {
  const t = useTranslations('ScrollToTop');
  const visible = useScrolledFar();

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      aria-label={t('label')}
      tabIndex={visible ? 0 : -1}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className={cn(
        'fixed right-4 bottom-4 z-40 rounded-full shadow-lg transition-all duration-300 motion-safe:transition-all',
        visible ? 'opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      )}
    >
      <ArrowUpIcon />
    </Button>
  );
}
