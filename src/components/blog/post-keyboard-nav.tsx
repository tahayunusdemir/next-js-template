'use client';

import * as React from 'react';
import { useRouter } from '@/libs/I18nNavigation';

// Wires the ← / → arrow keys to the previous/next article, matching the on-page nav.
// Ignores keypresses while typing in a field or with a modifier held. Renders nothing.
export function PostKeyboardNav(props: { previousSlug?: string; nextSlug?: string }) {
  const router = useRouter();

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) {
        return;
      }

      if (event.key === 'ArrowLeft' && props.previousSlug) {
        router.push(`/blog/${props.previousSlug}`);
      } else if (event.key === 'ArrowRight' && props.nextSlug) {
        router.push(`/blog/${props.nextSlug}`);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [props.previousSlug, props.nextSlug, router]);

  return null;
}
