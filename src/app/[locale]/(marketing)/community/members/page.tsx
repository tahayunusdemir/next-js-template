import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section } from '@/components/marketing/section';
import { ConnectionList } from '@/components/profile/connection-list';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';
import { listMembers } from '@/libs/Social';
import { getI18nPath } from '@/utils/Helpers';

type MembersPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: MembersPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'CommunityPage' });

  return {
    title: t('members_meta_title'),
    description: t('members_meta_description'),
    alternates: { canonical: getI18nPath('/community/members', locale) },
    openGraph: {
      title: t('members_meta_title'),
      description: t('members_meta_description'),
      type: 'website',
    },
  };
}

// Public, read-only member directory backing the community sidebar teaser. Mirrors the
// dashboard connections list, minus the follow/block actions that need a signed-in viewer.
export default async function MembersPage(props: MembersPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'CommunityPage' });
  const members = await listMembers({ limit: 50 });

  return (
    <Section className="py-10 sm:py-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Link
            href="/community"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 w-fit')}
          >
            <ArrowLeftIcon />
            {t('members_back')}
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('members')}</h1>
          <p className="text-sm text-muted-foreground">{t('members_subtitle')}</p>
        </div>

        <ConnectionList items={members} locale={locale} emptyMessage={t('members_empty')} />
      </div>
    </Section>
  );
}
