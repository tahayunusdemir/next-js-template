'use client';

import { useTranslations } from 'next-intl';
import { SearchDialog } from '@/components/search-dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from '@/libs/I18nNavigation';
import { sidebarItems } from '@/navigation/sidebar-items';
import type { NavTitleKey } from '@/navigation/sidebar-items';

const navItems = sidebarItems.flatMap((group) => group.items);

// Resolves the active dashboard route to its title key by matching the longest
// item url that prefixes the current path, so nested routes pick their parent.
function pageKey(pathname: string): NavTitleKey {
  const [match] = navItems
    .filter((item) => pathname.startsWith(item.url.replace(/\/+$/u, '')))
    .toSorted((a, b) => b.url.length - a.url.length);

  return match?.titleKey ?? 'home_link';
}

export function SiteHeader(props: { notifications?: React.ReactNode }) {
  const t = useTranslations('DashboardLayout');
  const pathname = usePathname();
  const page = pageKey(pathname);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{t(page)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <SearchDialog />
          {props.notifications}
        </div>
      </div>
    </header>
  );
}
