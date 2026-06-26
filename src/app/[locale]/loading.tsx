import { getTranslations } from 'next-intl/server';
import { CineLoader } from '@/components/cine-loader';

// Shared route-transition fallback for every page under the locale segment.
export default async function Loading() {
  const t = await getTranslations('Loading');

  return <CineLoader label={t('label')} />;
}
