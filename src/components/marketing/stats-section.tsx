import { useTranslations } from 'next-intl';

export function StatsSection() {
  const t = useTranslations('Stats');

  const stats = [
    { value: t('stat_1_value'), label: t('stat_1_label') },
    { value: t('stat_2_value'), label: t('stat_2_label') },
    { value: t('stat_3_value'), label: t('stat_3_label') },
    { value: t('stat_4_value'), label: t('stat_4_label') },
  ];

  return (
    <section className="border-b border-dashed py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                  {stat.value}
                </span>
                <span className="mt-2 block text-sm text-muted-foreground">{stat.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
