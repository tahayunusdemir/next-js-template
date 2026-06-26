'use client';

import { SignOutButton, useUser } from '@clerk/nextjs';
import {
  EllipsisVerticalIcon,
  HomeIcon,
  LogOutIcon,
  SettingsIcon,
  SmilePlusIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { FeedbackDialog } from '@/components/feedback-dialog';
import { LanguageToggleGroup } from '@/components/language-toggle-group';
import { ThemeToggleGroup } from '@/components/theme-toggle-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user } = useUser();
  const t = useTranslations('DashboardLayout');
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);

  const name = user?.fullName ?? user?.username ?? '';
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const avatar = user?.imageUrl;
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />}
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{name}</span>
              <span className="truncate text-xs text-foreground/70">{email}</span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56"
            side={isMobile ? 'bottom' : 'top'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="grid flex-1 leading-tight">
                    <span className="truncate font-medium">{name}</span>
                    <span className="truncate text-xs text-muted-foreground">{email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard/settings/" />}>
              <SettingsIcon />
              {t('settings_link')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setFeedbackOpen(true);
              }}
            >
              <SmilePlusIcon />
              {t('feedback')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between px-1.5 py-1 text-sm">
              <span>{t('theme')}</span>
              <ThemeToggleGroup />
            </div>
            <div className="flex items-center justify-between px-1.5 py-1 text-sm">
              <span>{t('language')}</span>
              <LanguageToggleGroup />
            </div>
            <DropdownMenuItem render={<Link href="/" />}>
              <HomeIcon />
              {t('home_page')}
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
            <div className="p-1 pt-1.5">
              <Link href="/pricing" className={cn(buttonVariants(), 'w-full')}>
                {t('upgrade_to_pro')}
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </SidebarMenu>
  );
}
