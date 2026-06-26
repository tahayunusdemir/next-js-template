'use client';

import type * as React from 'react';
import { cn } from '@/lib/utils';
import type { PostHeading } from '@/libs/Blog';
import { scrollToHeading, useActiveHeading } from './use-active-heading';

export function TableOfContents(props: {
  headings: PostHeading[];
  label: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const activeId = useActiveHeading(props.headings.map((heading) => heading.id));

  if (props.headings.length === 0) {
    return null;
  }

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    scrollToHeading(id);
    props.onNavigate?.();
  };

  return (
    <nav className={cn('space-y-3', props.className)} aria-label={props.label}>
      <p className="text-sm font-semibold">{props.label}</p>
      <ul className="space-y-2 border-l">
        {props.headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(event) => {
                handleClick(event, heading.id);
              }}
              className={cn(
                '-ml-px block border-l border-transparent pl-4 text-sm transition-colors hover:text-foreground',
                activeId === heading.id
                  ? 'border-foreground font-medium text-foreground'
                  : 'text-muted-foreground',
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
