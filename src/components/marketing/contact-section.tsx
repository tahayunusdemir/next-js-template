'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ClockIcon, MailIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { sendContactMessage } from '@/app/[locale]/(marketing)/actions';
import { Section, SectionHeading } from '@/components/marketing/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { ContactValidation } from '@/validations/LeadValidation';

export function ContactSection() {
  const t = useTranslations('Contact');
  const form = useForm({
    resolver: zodResolver(ContactValidation),
    defaultValues: { name: '', email: '', subject: 'general', message: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await sendContactMessage(values);

    if (result.ok) {
      toast.success(t('success'));
      form.reset();
    } else {
      toast.error(t('error'));
    }
  });

  const { errors } = form.formState;

  return (
    <Section id="contact">
      <SectionHeading badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />

      <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-[1fr_1.4fr]">
        {/* Contact details */}
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border bg-card text-muted-foreground">
              <MailIcon className="size-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{t('info_email_title')}</div>
              <div className="text-sm text-muted-foreground">{t('info_email_value')}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border bg-card text-muted-foreground">
              <ClockIcon className="size-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{t('info_response_title')}</div>
              <div className="text-sm text-muted-foreground">{t('info_response_value')}</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-4 rounded-xl border bg-card p-6 ring-1 ring-foreground/10"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-name">{t('name_label')}</Label>
              <Input
                id="contact-name"
                placeholder={t('name_placeholder')}
                aria-invalid={errors.name ? true : undefined}
                {...form.register('name')}
              />
              {errors.name ? (
                <p className="text-xs text-destructive">{t('name_required')}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-email">{t('email_label')}</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder={t('email_placeholder')}
                aria-invalid={errors.email ? true : undefined}
                {...form.register('email')}
              />
              {errors.email ? (
                <p className="text-xs text-destructive">{t('email_invalid')}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact-subject">{t('subject_label')}</Label>
            <NativeSelect id="contact-subject" className="w-full" {...form.register('subject')}>
              <NativeSelectOption value="general">{t('subject_general')}</NativeSelectOption>
              <NativeSelectOption value="sales">{t('subject_sales')}</NativeSelectOption>
              <NativeSelectOption value="support">{t('subject_support')}</NativeSelectOption>
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact-message">{t('message_label')}</Label>
            <Textarea
              id="contact-message"
              rows={4}
              placeholder={t('message_placeholder')}
              aria-invalid={errors.message ? true : undefined}
              {...form.register('message')}
            />
            {errors.message ? (
              <p className="text-xs text-destructive">{t('message_required')}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting} className="rounded-full">
            {form.formState.isSubmitting ? t('submitting') : t('submit')}
          </Button>
        </form>
      </div>
    </Section>
  );
}
