import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function DashboardPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('Dashboard');
  const user = await currentUser();

  return (
    <div className="py-5 [&_p]:my-6">
      <p>
        {`👋 `}
        {t('hello_message', {
          email: user?.primaryEmailAddress?.emailAddress ?? '',
        })}
      </p>
    </div>
  );
}
