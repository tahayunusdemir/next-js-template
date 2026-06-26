import { LockIcon, RotateCcwIcon, ShieldCheckIcon, SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function TrustBadges() {
  const t = useTranslations('TrustBadges');

  const badges = [
    { Icon: SparklesIcon, label: t('free_to_start') },
    { Icon: ShieldCheckIcon, label: t('gdpr') },
    { Icon: LockIcon, label: t('encrypted') },
    { Icon: RotateCcwIcon, label: t('cancel_anytime') },
  ];

  return (
    <section className="border-b border-dashed py-12">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-muted-foreground">{t('title')}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {badges.map(({ Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="size-4 text-foreground" aria-hidden />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
