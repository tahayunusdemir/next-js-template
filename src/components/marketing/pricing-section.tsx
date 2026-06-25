'use client';

import { ArrowRightIcon, CheckIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { Section, SectionHeading } from '@/components/marketing/section';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';

export function PricingSection(props: { showCompareLink?: boolean }) {
  const t = useTranslations('Pricing');
  const [annual, setAnnual] = React.useState(false);

  const plans = [
    {
      key: 'starter',
      name: t('starter_name'),
      description: t('starter_description'),
      monthly: 0,
      annual: 0,
      cta: t('starter_cta'),
      href: '/sign-up',
      popular: false,
      includes: undefined as string | undefined,
      features: [
        t('starter_feature_1'),
        t('starter_feature_2'),
        t('starter_feature_3'),
        t('starter_feature_4'),
        t('starter_feature_5'),
        t('starter_feature_6'),
      ],
    },
    {
      key: 'pro',
      name: t('pro_name'),
      description: t('pro_description'),
      monthly: 29,
      annual: 24,
      cta: t('pro_cta'),
      href: '/sign-up',
      popular: true,
      includes: t('pro_includes'),
      features: [
        t('pro_feature_1'),
        t('pro_feature_2'),
        t('pro_feature_3'),
        t('pro_feature_4'),
        t('pro_feature_5'),
      ],
    },
    {
      key: 'business',
      name: t('business_name'),
      description: t('business_description'),
      monthly: 99,
      annual: 79,
      cta: t('business_cta'),
      href: '/about#contact',
      popular: false,
      includes: t('business_includes'),
      features: [
        t('business_feature_1'),
        t('business_feature_2'),
        t('business_feature_3'),
        t('business_feature_4'),
        t('business_feature_5'),
      ],
    },
  ];

  return (
    <Section id="pricing">
      <SectionHeading badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />

      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="inline-flex items-center rounded-full border p-1">
          <button
            type="button"
            onClick={() => {
              setAnnual(false);
            }}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
              !annual && 'bg-background text-foreground shadow-sm',
            )}
          >
            {t('billing_monthly')}
          </button>
          <button
            type="button"
            onClick={() => {
              setAnnual(true);
            }}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
              annual && 'bg-background text-foreground shadow-sm',
            )}
          >
            {t('billing_annual')}
          </button>
        </div>
        <p className="text-sm text-muted-foreground">{t('billing_save')}</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl items-stretch gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.key}
            className={cn(
              'flex h-full flex-col rounded-2xl border bg-card p-6 ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg',
              plan.popular &&
                'border-transparent bg-primary text-primary-foreground shadow-xl ring-0 hover:shadow-2xl',
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-medium">{plan.name}</h3>
              {plan.popular ? (
                <Badge className="bg-primary-foreground text-primary">{t('most_popular')}</Badge>
              ) : null}
            </div>
            <p
              className={cn(
                'mt-1 text-sm text-pretty',
                plan.popular ? 'text-primary-foreground/70' : 'text-muted-foreground',
              )}
            >
              {plan.description}
            </p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-heading text-4xl font-semibold tracking-tight">
                ${annual ? plan.annual : plan.monthly}
              </span>
              <span
                className={cn(
                  'text-sm',
                  plan.popular ? 'text-primary-foreground/70' : 'text-muted-foreground',
                )}
              >
                {t('per_month')}
              </span>
            </div>

            <Link
              href={plan.href}
              className={cn(
                'mt-6 w-full rounded-full transition-transform hover:-translate-y-0.5',
                plan.popular
                  ? cn(
                      buttonVariants({ size: 'lg' }),
                      'border-transparent bg-background text-foreground hover:bg-background/90',
                    )
                  : buttonVariants({ variant: 'outline', size: 'lg' }),
              )}
            >
              {plan.cta}
            </Link>

            <ul className="mt-6 space-y-3 text-sm">
              {plan.includes ? <li className="font-medium">{plan.includes}</li> : null}
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <CheckIcon
                    className={cn(
                      'mt-0.5 size-4 shrink-0',
                      plan.popular ? 'text-primary-foreground' : 'text-foreground',
                    )}
                  />
                  <span
                    className={
                      plan.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {props.showCompareLink ? (
        <div className="mt-10 text-center">
          <Link
            href="/pricing"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t('compare_link')}
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      ) : null}
    </Section>
  );
}
