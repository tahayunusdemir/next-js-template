import { ArrowLeftIcon } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'ProfilePage' });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-2')}>
            <ArrowLeftIcon className="size-4" />
            {t('back')}
          </Link>
        </div>
      </header>
      <main id="main" className="flex-1">
        {props.children}
      </main>
    </div>
  );
}
