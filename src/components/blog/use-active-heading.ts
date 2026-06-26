'use client';

import * as React from 'react';

const SCROLL_OFFSET = 100;

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  window.addEventListener('resize', onChange);
  return () => {
    window.removeEventListener('scroll', onChange);
    window.removeEventListener('resize', onChange);
  };
}

// Tracks the heading nearest the top of the viewport without a layout effect. Shared by
// the sidebar table of contents and the desktop minimap so both highlight in lockstep.
export function useActiveHeading(ids: string[]): string {
  const getSnapshot = () => {
    let active = ids[0] ?? '';
    for (const id of ids) {
      const element = document.querySelector(`#${CSS.escape(id)}`);
      if (element && element.getBoundingClientRect().top <= SCROLL_OFFSET + 20) {
        active = id;
      }
    }
    return active;
  };

  return React.useSyncExternalStore(subscribe, getSnapshot, () => ids[0] ?? '');
}

// Smoothly scrolls to a heading and updates the URL hash, accounting for the fixed offset.
export function scrollToHeading(id: string) {
  const element = document.querySelector(`#${CSS.escape(id)}`);
  if (element) {
    const top = element.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
    window.history.replaceState(null, '', `#${id}`);
  }
}
