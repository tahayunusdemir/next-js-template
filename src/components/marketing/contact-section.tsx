'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
    defaultValues: { email: '', subject: 'general', message: '' },
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

      <form onSubmit={onSubmit} noValidate className="mx-auto mt-12 flex max-w-xl flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-email">{t('email_label')}</Label>
          <Input
            id="contact-email"
            type="email"
            aria-invalid={errors.email ? true : undefined}
            {...form.register('email')}
          />
          {errors.email ? <p className="text-xs text-destructive">{t('email_invalid')}</p> : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-subject">{t('subject_label')}</Label>
          <NativeSelect id="contact-subject" className="w-full" {...form.register('subject')}>
            <NativeSelectOption value="general">{t('subject_general')}</NativeSelectOption>
            <NativeSelectOption value="partnerships">
              {t('subject_partnerships')}
            </NativeSelectOption>
            <NativeSelectOption value="support">{t('subject_support')}</NativeSelectOption>
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-message">{t('message_label')}</Label>
          <Textarea
            id="contact-message"
            rows={5}
            aria-invalid={errors.message ? true : undefined}
            className="resize-none"
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
    </Section>
  );
}
