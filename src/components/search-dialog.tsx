'use client';

import { HomeIcon, LayoutDashboardIcon, SearchIcon, UserIcon } from 'lucide-react';
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
} from '@/components/ui/command';
import { useRouter } from '@/libs/I18nNavigation';

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

  const items = [
    { title: t('dashboard_link'), url: '/dashboard/', icon: <LayoutDashboardIcon /> },
    { title: t('user_profile_link'), url: '/dashboard/user-profile/', icon: <UserIcon /> },
    { title: t('home_page'), url: '/', icon: <HomeIcon /> },
  ];

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
            <CommandGroup heading={t('pages')}>
              {items.map((item) => (
                <CommandItem
                  key={item.url}
                  value={item.title}
                  onSelect={() => {
                    handleSelect(item.url);
                  }}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
