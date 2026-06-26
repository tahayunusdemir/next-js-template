import { setRequestLocale } from 'next-intl/server';
import { CineTestFlow } from '@/components/marketing/cinetest/cinetest-flow';

type DashboardCineTestPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardCineTestPage(props: DashboardCineTestPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <CineTestFlow />;
}
