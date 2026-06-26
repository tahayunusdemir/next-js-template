import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CheckoutSection } from '@/components/marketing/checkout-section';
import type { BillingPeriod } from '@/lib/plans';
import { getPlan, isPaidPlan } from '@/lib/plans';
import { redirect } from '@/libs/I18nNavigation';

type CheckoutPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plan?: string; billing?: string }>;
};

export async function generateMetadata(props: CheckoutPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'CheckoutPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutRoutePage(props: CheckoutPageProps) {
  const [{ locale }, searchParams] = await Promise.all([props.params, props.searchParams]);
  setRequestLocale(locale);

  const plan = getPlan(searchParams.plan ?? '');

  if (!plan || !isPaidPlan(plan)) {
    redirect({ href: '/pricing', locale });
    return null;
  }

  const billing: BillingPeriod = searchParams.billing === 'annual' ? 'annual' : 'monthly';

  return <CheckoutSection planId={plan.id} billing={billing} />;
}
