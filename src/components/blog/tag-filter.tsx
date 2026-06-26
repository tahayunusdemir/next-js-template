'use client';

import { ChevronDownIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from '@/libs/I18nNavigation';

export type TagOption = { value: string; label: string; count: number };

// Filters the listing by tag via the URL (`?tag=`). Labels and counts are resolved on
// the server and passed in, so this client component stays free of dynamic i18n lookups.
export function TagFilter(props: {
  options: TagOption[];
  selected: string;
  categoryLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const select = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete('tag');
    } else {
      params.set('tag', value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const selectedLabel =
    props.options.find((option) => option.value === props.selected)?.label ??
    props.options[0]?.label;

  return (
    <>
      <div className="hidden flex-wrap gap-2 md:flex">
        {props.options.map((option) => {
          const isActive = option.value === props.selected;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                select(option.value);
              }}
              className={cn(
                'flex h-8 items-center gap-2 rounded-lg border pr-1 pl-3 text-sm transition-colors',
                isActive ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted',
              )}
            >
              <span>{option.label}</span>
              <span
                className={cn(
                  'flex h-6 min-w-6 items-center justify-center rounded-md border text-xs font-medium',
                  isActive && 'border-primary-foreground/30 bg-background text-primary',
                )}
              >
                {option.count}
              </span>
            </button>
          );
        })}
      </div>

      <Drawer>
        <DrawerTrigger className="flex w-full items-center justify-between rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted md:hidden">
          <span>{selectedLabel}</span>
          <ChevronDownIcon className="size-4" />
        </DrawerTrigger>
        <DrawerContent className="md:hidden">
          <DrawerHeader>
            <DrawerTitle>{props.categoryLabel}</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-1 p-4">
            {props.options.map((option) => (
              <DrawerClose key={option.value} asChild>
                <button
                  type="button"
                  onClick={() => {
                    select(option.value);
                  }}
                  className={cn(
                    'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
                    option.value === props.selected
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  <span>{option.label}</span>
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-md border text-xs font-medium">
                    {option.count}
                  </span>
                </button>
              </DrawerClose>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
