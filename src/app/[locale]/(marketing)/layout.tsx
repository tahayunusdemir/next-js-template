import { ClerkProvider } from '@clerk/nextjs';
import { setRequestLocale } from 'next-intl/server';
import { AnnouncementBar } from '@/components/marketing/announcement-bar';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { ScrollToTop } from '@/components/marketing/scroll-to-top';
import { ClerkLocalizations } from '@/utils/AppConfig';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const clerkLocale =
    ClerkLocalizations.supportedLocales[locale] ?? ClerkLocalizations.defaultLocale;

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      {/* Provides Clerk context so the header can reflect the signed-in user on public pages. */}
      <ClerkProvider
        appearance={{ cssLayerName: 'clerk' }}
        localization={clerkLocale}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        afterSignOutUrl="/"
      >
        <MarketingHeader />
      </ClerkProvider>
      <main id="main" className="flex-1">
        {props.children}
      </main>
      <MarketingFooter />
      <ScrollToTop />
    </div>
  );
}
