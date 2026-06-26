'use client';

import * as React from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  window.addEventListener('resize', onChange);
  return () => {
    window.removeEventListener('scroll', onChange);
    window.removeEventListener('resize', onChange);
  };
}

function getScrollProgress() {
  const element = document.documentElement;
  const max = element.scrollHeight - element.clientHeight;
  return max > 0 ? Math.min(1, Math.max(0, element.scrollTop / max)) : 0;
}

// Reads scroll depth as a 0–1 ratio without a layout effect, matching the TOC scrollspy.
function useScrollProgress(): number {
  return React.useSyncExternalStore(subscribe, getScrollProgress, () => 0);
}

// A thin reading-progress bar pinned above the page chrome. Monochrome, GPU-composited
// (transform only), and quiet for users who prefer reduced motion.
export function ReadingProgress() {
  const progress = useScrollProgress();

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent">
      <div
        className="h-full origin-left bg-foreground transition-transform duration-150 ease-out motion-reduce:transition-none"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
