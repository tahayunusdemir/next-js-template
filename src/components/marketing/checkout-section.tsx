'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon, CheckIcon, LockIcon, ShieldCheckIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createCheckoutSession } from '@/app/[locale]/(marketing)/checkout/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BillingPeriod, PaidPlanId } from '@/lib/plans';
import {
  formatPrice,
  getAnnualListPrice,
  getAnnualSavings,
  getMonthlyPrice,
  getPeriodTotal,
  getPlan,
} from '@/lib/plans';
import { cn } from '@/lib/utils';
import { Link } from '@/libs/I18nNavigation';
import { CheckoutValidation } from '@/validations/CheckoutValidation';

export function CheckoutSection(props: { planId: PaidPlanId; billing: BillingPeriod }) {
  const t = useTranslations('Checkout');
  const tp = useTranslations('Pricing');
  const [billing, setBilling] = React.useState<BillingPeriod>(props.billing);
  const form = useForm({
    resolver: zodResolver(CheckoutValidation),
    defaultValues: { plan: props.planId, billing: props.billing, email: '', name: '' },
  });

  const plan = getPlan(props.planId);

  if (!plan) {
    return null;
  }

  const total = getPeriodTotal(plan, billing);
  const monthly = getMonthlyPrice(plan, billing);
  const savings = getAnnualSavings(plan);
  const features = plan.features.map((key) => tp(key));

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await createCheckoutSession({ ...values, billing });

    if (result.ok) {
      window.location.href = result.url;
    } else {
      toast.info(t('unavailable'));
    }
  });

  const { errors } = form.formState;

  return (
    <section className="border-b border-dashed py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/pricing"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
          {t('back_to_pricing')}
        </Link>

        <div className="mt-6 max-w-2xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-base text-pretty text-muted-foreground sm:text-lg">
            {t('subtitle')}
          </p>
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
          {/* Billing details */}
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
            <div className="rounded-2xl border bg-card p-6 ring-1 ring-foreground/10">
              <h2 className="font-heading text-lg font-medium">{t('contact_heading')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('contact_subtitle')}</p>

              <div className="mt-5 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="checkout-name">{t('name_label')}</Label>
                  <Input
                    id="checkout-name"
                    autoComplete="name"
                    placeholder={t('name_placeholder')}
                    aria-invalid={errors.name ? true : undefined}
                    {...form.register('name')}
                  />
                  {errors.name ? (
                    <p className="text-xs text-destructive">{t('name_required')}</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="checkout-email">{t('email_label')}</Label>
                  <Input
                    id="checkout-email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('email_placeholder')}
                    aria-invalid={errors.email ? true : undefined}
                    {...form.register('email')}
                  />
                  {errors.email ? (
                    <p className="text-xs text-destructive">{t('email_invalid')}</p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Payment — placeholder until Stripe billing is live */}
            <div className="rounded-2xl border bg-card p-6 ring-1 ring-foreground/10">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-heading text-lg font-medium">{t('payment_heading')}</h2>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <LockIcon className="size-3.5" />
                  {t('powered_by_stripe')}
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-dashed bg-muted/30 px-5 py-8 text-center">
                <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-foreground/5 ring-1 ring-foreground/10">
                  <ShieldCheckIcon className="size-5 text-foreground" />
                </div>
                <p className="mt-4 text-sm font-medium">{t('payment_notice_title')}</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-pretty text-muted-foreground">
                  {t('payment_notice_body')}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="w-full rounded-full"
            >
              {form.formState.isSubmitting ? t('submitting') : t('submit')}
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <LockIcon className="size-3.5" />
              {t('secure_note')}
            </p>
          </form>

          {/* Order summary */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border bg-card p-6 ring-1 ring-foreground/10">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-heading text-lg font-medium">{t('summary_heading')}</h2>
                {plan.popular ? <Badge variant="outline">{tp('most_popular')}</Badge> : null}
              </div>

              <div className="mt-5 inline-flex w-full items-center rounded-full border p-1">
                <button
                  type="button"
                  aria-pressed={billing === 'monthly'}
                  onClick={() => {
                    setBilling('monthly');
                  }}
                  className={cn(
                    'flex-1 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                    billing === 'monthly' && 'bg-background text-foreground shadow-sm',
                  )}
                >
                  {t('billing_monthly')}
                </button>
                <button
                  type="button"
                  aria-pressed={billing === 'annual'}
                  onClick={() => {
                    setBilling('annual');
                  }}
                  className={cn(
                    'flex-1 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                    billing === 'annual' && 'bg-background text-foreground shadow-sm',
                  )}
                >
                  {t('billing_annual')}
                </button>
              </div>

              <div className="mt-6 flex items-baseline justify-between gap-2">
                <span className="font-heading text-lg font-medium">{tp(`${plan.id}_name`)}</span>
                <span className="text-sm text-muted-foreground">
                  {billing === 'annual' ? t('per_year') : t('per_month')}
                </span>
              </div>

              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">{t('subtotal')}</dt>
                  <dd>
                    $
                    {billing === 'annual'
                      ? formatPrice(getAnnualListPrice(plan))
                      : formatPrice(plan.monthly)}
                  </dd>
                </div>
                {billing === 'annual' && savings > 0 ? (
                  <div className="flex items-center justify-between text-foreground">
                    <dt>{t('annual_discount')}</dt>
                    <dd>
                      −$
                      {formatPrice(savings)}
                    </dd>
                  </div>
                ) : null}
                <div className="mt-3 flex items-baseline justify-between border-t pt-3">
                  <dt className="font-medium">{t('total')}</dt>
                  <dd className="font-heading text-2xl font-semibold tracking-tight">
                    ${formatPrice(total)}
                  </dd>
                </div>
              </dl>

              {billing === 'annual' ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {t('annual_equivalent', { price: formatPrice(monthly) })}
                </p>
              ) : null}

              <div className="mt-6 border-t pt-5">
                <p className="text-sm font-medium">{t('includes_heading')}</p>
                <ul className="mt-3 space-y-2.5 text-sm">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-foreground" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">{t('guarantee')}</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
