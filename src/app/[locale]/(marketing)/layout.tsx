import { setRequestLocale } from 'next-intl/server';
import { AnnouncementBar } from '@/components/marketing/announcement-bar';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { ScrollToTop } from '@/components/marketing/scroll-to-top';
import { Toaster } from '@/components/ui/sonner';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <MarketingHeader />
      <main id="main" className="flex-1">
        {props.children}
      </main>
      <MarketingFooter />
      <ScrollToTop />
      <Toaster />
    </div>
  );
}
