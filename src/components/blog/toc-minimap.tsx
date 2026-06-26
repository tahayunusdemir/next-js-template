'use client';

import type * as React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import type { PostHeading } from '@/libs/Blog';
import { scrollToHeading, useActiveHeading } from './use-active-heading';

function handleHeadingClick(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault();
  scrollToHeading(id);
}

// A compact vertical "minimap" of the article headings for the desktop aside: each
// heading is a thin rule that widens and brightens when active, and a hover reveals the
// full labelled table of contents. Reuses the shared scrollspy so it stays in lockstep
// with the sidebar TOC. Adapted from chanhdai.com's TOCMinimap, re-skinned monochrome
// and stripped of its sound/analytics extras.
export function TocMinimap(props: { headings: PostHeading[]; label: string }) {
  const activeId = useActiveHeading(props.headings.map((heading) => heading.id));

  if (props.headings.length === 0) {
    return null;
  }

  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <div aria-hidden className="flex w-16 cursor-pointer flex-col items-end gap-2.5 py-1" />
        }
      >
        {props.headings.map((heading) => (
          <span
            key={heading.id}
            className={cn(
              'h-0.5 rounded-full transition-all duration-200',
              activeId === heading.id ? 'w-8 bg-foreground' : 'w-4 bg-border',
            )}
          />
        ))}
      </HoverCardTrigger>

      <HoverCardContent side="left" align="start" className="w-64">
        <p className="mb-2 px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {props.label}
        </p>
        <ul className="space-y-1">
          {props.headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(event) => {
                  handleHeadingClick(event, heading.id);
                }}
                className={cn(
                  'block rounded-md px-1 py-1 text-sm transition-colors hover:text-foreground',
                  activeId === heading.id ? 'font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}
