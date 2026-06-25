'use client';

import { MenuIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';
import { Brand } from './brand';

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => {
    window.removeEventListener('scroll', onChange);
  };
}

// Tracks whether the page has scrolled past the top without a layout effect.
function useScrolled() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.scrollY > 8,
    () => false,
  );
}

export function MarketingHeader() {
  const t = useTranslations('MarketingHeader');
  const isScrolled = useScrolled();

  const navItems = [
    { label: t('nav_features'), href: '/#features' },
    { label: t('nav_pricing'), href: '/pricing' },
    { label: t('nav_about'), href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 px-2 pt-3">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
      >
        {t('skip_to_content')}
      </a>

      <div
        className={cn(
          'mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-transparent px-4 transition-all duration-300 sm:px-6',
          isScrolled && 'max-w-4xl border-border bg-background/70 px-4 shadow-sm backdrop-blur-lg',
        )}
      >
        <Link href="/" aria-label={t('brand_home')}>
          <Brand />
        </Link>

        <nav aria-label={t('menu_title')} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/sign-in" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            {t('sign_in')}
          </Link>
          <Link href="/sign-up" className={cn(buttonVariants({ size: 'sm' }), 'rounded-full px-4')}>
            {t('get_started')}
          </Link>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              aria-label={t('open_menu')}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'icon-sm' }),
                'rounded-full',
              )}
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{t('menu_title')}</SheetTitle>
                <SheetDescription>{t('menu_description')}</SheetDescription>
              </SheetHeader>
              <nav className="px-4">
                <ul className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <SheetClose
                        render={
                          <Link
                            href={item.href}
                            className="block rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {item.label}
                          </Link>
                        }
                      />
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto flex flex-col gap-2 p-4">
                <Link
                  href="/sign-in"
                  className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
                >
                  {t('sign_in')}
                </Link>
                <Link href="/sign-up" className={cn(buttonVariants(), 'w-full')}>
                  {t('get_started')}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
