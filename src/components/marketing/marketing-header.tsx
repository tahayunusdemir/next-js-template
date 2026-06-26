'use client';

import { SignOutButton, useUser } from '@clerk/nextjs';
import { LayoutDashboardIcon, LogOutIcon, MenuIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { getInitials } from '@/utils/Helpers';
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
  const { isSignedIn, user } = useUser();

  const name = user?.username ?? user?.fullName ?? '';
  const avatar = user?.imageUrl;

  const navItems = [
    { label: t('nav_films'), href: '/films' },
    { label: t('nav_community'), href: '/community' },
    { label: t('nav_cinetype'), href: '/cinetype' },
    { label: t('nav_cinetest'), href: '/cinetest' },
    { label: t('nav_cinematch'), href: '/cinematch' },
    { label: t('nav_pricing'), href: '/pricing' },
    { label: t('nav_blog'), href: '/blog' },
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
          isScrolled && 'max-w-5xl border-border bg-background/70 px-4 shadow-sm backdrop-blur-lg',
        )}
      >
        <Link href="/" aria-label={t('brand_home')} className="shrink-0">
          <Brand />
        </Link>

        <nav aria-label={t('menu_title')} className="hidden lg:block">
          <ul className="flex items-center gap-0.5 xl:gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-2.5 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground xl:px-3"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={name}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'rounded-full p-0',
                )}
              >
                <Avatar className="size-8">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuItem render={<Link href="/dashboard" />}>
                  <LayoutDashboardIcon />
                  {t('dashboard')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <SignOutButton>
                  <DropdownMenuItem
                    variant="destructive"
                    className="font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOutIcon />
                    {t('sign_out')}
                  </DropdownMenuItem>
                </SignOutButton>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/sign-in"
              className={cn(buttonVariants({ size: 'sm' }), 'rounded-full px-4')}
            >
              {t('sign_in')}
            </Link>
          )}
        </div>

        <div className="lg:hidden">
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
                {isSignedIn ? (
                  <>
                    <SheetClose
                      render={
                        <Link href="/dashboard" className={cn(buttonVariants(), 'w-full')}>
                          {t('dashboard')}
                        </Link>
                      }
                    />
                    <SignOutButton>
                      <button
                        type="button"
                        className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
                      >
                        {t('sign_out')}
                      </button>
                    </SignOutButton>
                  </>
                ) : (
                  <Link href="/sign-in" className={cn(buttonVariants(), 'w-full')}>
                    {t('sign_in')}
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
