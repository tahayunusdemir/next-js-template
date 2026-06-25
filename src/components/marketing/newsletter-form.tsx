'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { subscribeNewsletter } from '@/app/[locale]/(marketing)/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NewsletterValidation } from '@/validations/LeadValidation';

export function NewsletterForm() {
  const t = useTranslations('Newsletter');
  const form = useForm({
    resolver: zodResolver(NewsletterValidation),
    defaultValues: { email: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await subscribeNewsletter(values);

    if (result.ok) {
      toast.success(t('success'));
      form.reset();
    } else {
      toast.error(t('error'));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-sm">
      <div className="flex items-center gap-2">
        <Input
          type="email"
          placeholder={t('placeholder')}
          aria-label={t('aria_label')}
          aria-invalid={form.formState.errors.email ? true : undefined}
          className="rounded-full"
          {...form.register('email')}
        />
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="shrink-0 rounded-full px-4"
        >
          {t('cta')}
        </Button>
      </div>
      {form.formState.errors.email ? (
        <p className="mt-2 text-xs text-destructive">{t('invalid_email')}</p>
      ) : null}
    </form>
  );
}
