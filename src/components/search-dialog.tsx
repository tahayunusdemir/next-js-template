'use client';

import { HomeIcon, SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useRouter } from '@/libs/I18nNavigation';
import { sidebarItems } from '@/navigation/sidebar-items';

export function SearchDialog() {
  const t = useTranslations('DashboardLayout');
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => {
      document.removeEventListener('keydown', down);
    };
  }, []);

  const handleSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(true);
        }}
        className="gap-2 font-normal text-muted-foreground"
      >
        <SearchIcon />
        <span className="hidden md:inline">{t('search')}</span>
        <kbd className="pointer-events-none hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium select-none md:inline-flex">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t('search')}
        description={t('search_placeholder')}
      >
        <Command>
          <CommandInput placeholder={t('search_placeholder')} />
          <CommandList>
            <CommandEmpty>{t('search_empty')}</CommandEmpty>
            {sidebarItems.map((group, index) => (
              <React.Fragment key={group.id}>
                {index > 0 && <CommandSeparator />}
                <CommandGroup heading={group.labelKey ? t(group.labelKey) : t('pages')}>
                  {group.items.map((item) => {
                    const title = t(item.titleKey);
                    const Icon = item.icon;

                    return (
                      <CommandItem
                        key={item.id}
                        value={title}
                        disabled={item.disabled}
                        onSelect={() => {
                          handleSelect(item.url);
                        }}
                      >
                        <Icon />
                        <span>{title}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </React.Fragment>
            ))}
            <CommandSeparator />
            <CommandGroup heading={t('pages')}>
              <CommandItem
                value={t('home_page')}
                onSelect={() => {
                  handleSelect('/');
                }}
              >
                <HomeIcon />
                <span>{t('home_page')}</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
