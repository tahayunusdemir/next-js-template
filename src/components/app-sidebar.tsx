'use client';

import { CommandIcon, LayoutDashboardIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link } from '@/libs/I18nNavigation';
import { AppConfig } from '@/utils/AppConfig';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('DashboardLayout');

  const navMain = [
    {
      title: t('dashboard_link'),
      url: '/dashboard/',
      icon: <LayoutDashboardIcon />,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard/" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">{AppConfig.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
