'use client';

import { useTranslations } from 'next-intl';
import { SearchDialog } from '@/components/search-dialog';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from '@/libs/I18nNavigation';

export function SiteHeader() {
  const t = useTranslations('DashboardLayout');
  const pathname = usePathname();
  const title = pathname.includes('/dashboard/user-profile')
    ? t('user_profile_link')
    : t('dashboard_link');

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
        <h1 className="min-w-0 truncate text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <SearchDialog />
        </div>
      </div>
    </header>
  );
}
