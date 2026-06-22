'use client';

import {
  CircleHelpIcon,
  CommandIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  FileIcon,
  LayoutDashboardIcon,
  SearchIcon,
  Settings2Icon,
  UserIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
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

const data = {
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: <Settings2Icon />,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: <CircleHelpIcon />,
    },
    {
      title: 'Search',
      url: '#',
      icon: <SearchIcon />,
    },
  ],
  documents: [
    {
      name: 'Data Library',
      url: '#',
      icon: <DatabaseIcon />,
    },
    {
      name: 'Reports',
      url: '#',
      icon: <FileChartColumnIcon />,
    },
    {
      name: 'Word Assistant',
      url: '#',
      icon: <FileIcon />,
    },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('DashboardLayout');

  const navMain = [
    {
      title: t('dashboard_link'),
      url: '/dashboard/',
      icon: <LayoutDashboardIcon />,
    },
    {
      title: t('user_profile_link'),
      url: '/dashboard/user-profile/',
      icon: <UserIcon />,
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
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
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
