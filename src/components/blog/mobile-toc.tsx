'use client';

import { ListIcon } from 'lucide-react';
import * as React from 'react';
import { TableOfContents } from '@/components/blog/table-of-contents';
import { buttonVariants } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import type { PostHeading } from '@/libs/Blog';

// Floating table-of-contents for small screens, where the desktop aside is hidden.
export function MobileTableOfContents(props: { headings: PostHeading[]; label: string }) {
  const [open, setOpen] = React.useState(false);

  if (props.headings.length === 0) {
    return null;
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        aria-label={props.label}
        className={cn(
          buttonVariants({ size: 'sm' }),
          'fixed right-4 bottom-4 z-40 gap-2 rounded-full shadow-lg lg:hidden',
        )}
      >
        <ListIcon className="size-4" />
        {props.label}
      </DrawerTrigger>
      <DrawerContent className="lg:hidden">
        <DrawerHeader>
          <DrawerTitle>{props.label}</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto p-4">
          <TableOfContents
            headings={props.headings}
            label={props.label}
            onNavigate={() => {
              setOpen(false);
            }}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
