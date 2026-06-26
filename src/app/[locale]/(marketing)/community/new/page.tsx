import { redirect } from 'next/navigation';
import { getI18nPath } from '@/utils/Helpers';

type NewPostPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Posting is dashboard-only, so the public route forwards to the dashboard composer (which
// sits behind auth), carrying any preselected category along.
export default async function NewPostPage(props: NewPostPageProps) {
  const { locale } = await props.params;
  const { category } = await props.searchParams;

  const target = getI18nPath('/dashboard/community/new', locale);
  redirect(typeof category === 'string' ? `${target}?category=${category}` : target);
}
