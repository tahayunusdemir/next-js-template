import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AppSidebar } from '@/components/app-sidebar';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

type DashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: DashboardLayoutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function DashboardLayout(props: DashboardLayoutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader notifications={<NotificationBell locale={locale} />} />
          {props.children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
