'use client';

import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import type { Control, UseFormRegisterReturn } from 'react-hook-form';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type * as z from 'zod';
import { saveProfile } from '@/app/[locale]/(auth)/dashboard/settings/actions';
import { AvatarUploader } from '@/components/profile/avatar-uploader';
import { CountryCombobox } from '@/components/profile/country-combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { detectPlatform } from '@/lib/socials';
import { useRouter } from '@/libs/I18nNavigation';
import { BIO_MAX, NAME_MAX, ProfileFormValidation } from '@/validations/ProfileValidation';

type ProfileFormValues = z.input<typeof ProfileFormValidation>;

type FieldProps = {
  control: Control<ProfileFormValues>;
  register: UseFormRegisterReturn;
  invalid: boolean;
};

// Isolated so the live character counter only re-renders this field, not the form.
function BioField(props: FieldProps) {
  const t = useTranslations('ProfileSettingsPage');
  const value = useWatch({ control: props.control, name: 'bio' }) ?? '';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor="bio">{t('bio_label')}</Label>
        <span className="text-xs text-muted-foreground tabular-nums">
          {`${value.length}/${BIO_MAX}`}
        </span>
      </div>
      <Textarea
        id="bio"
        rows={3}
        maxLength={BIO_MAX}
        className="resize-none"
        aria-invalid={props.invalid ? true : undefined}
        {...props.register}
      />
    </div>
  );
}

// Isolated so the platform icon updates as you type without re-rendering the form.
function WebsiteField(props: FieldProps & { invalidMessage?: string }) {
  const t = useTranslations('ProfileSettingsPage');
  const value = useWatch({ control: props.control, name: 'website' }) ?? '';
  const platform = detectPlatform(value);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="website">{t('website_label')}</Label>
      <div className="relative">
        <platform.Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="website"
          type="url"
          className="pl-9"
          aria-invalid={props.invalid ? true : undefined}
          {...props.register}
        />
      </div>
      {props.invalidMessage ? (
        <p className="text-xs text-destructive">{props.invalidMessage}</p>
      ) : null}
    </div>
  );
}

type EditProfileFormProps = {
  defaults: {
    firstName: string;
    lastName: string;
    username: string;
    bio: string;
    country: string;
    website: string;
  };
};

export function EditProfileForm(props: EditProfileFormProps) {
  const t = useTranslations('ProfileSettingsPage');
  const { user } = useUser();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormValidation),
    defaultValues: {
      firstName: props.defaults.firstName,
      lastName: props.defaults.lastName,
      bio: props.defaults.bio,
      country: props.defaults.country,
      website: props.defaults.website,
    },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    if (user) {
      const updated = await user
        .update({
          firstName: values.firstName,
          lastName: values.lastName,
        })
        .then(() => true)
        .catch(() => false);

      if (!updated) {
        toast.error(t('error'));
        return;
      }
    }

    const result = await saveProfile({
      bio: values.bio,
      country: values.country,
      website: values.website,
    });

    if (result.ok) {
      toast.success(t('success'));
      router.refresh();
    } else {
      toast.error(t('error'));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      <AvatarUploader />

      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firstName">{t('first_name_label')}</Label>
          <Input
            id="firstName"
            maxLength={NAME_MAX}
            aria-invalid={errors.firstName ? true : undefined}
            {...form.register('firstName')}
          />
          {errors.firstName ? (
            <p className="text-xs text-destructive">{t('name_invalid')}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastName">{t('last_name_label')}</Label>
          <Input
            id="lastName"
            maxLength={NAME_MAX}
            aria-invalid={errors.lastName ? true : undefined}
            {...form.register('lastName')}
          />
          {errors.lastName ? <p className="text-xs text-destructive">{t('name_invalid')}</p> : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">{t('handle_label')}</Label>
          <Input id="username" value={props.defaults.username} readOnly disabled />
          <p className="text-xs text-muted-foreground">{t('handle_hint')}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="country">{t('country_label')}</Label>
          <Controller
            control={form.control}
            name="country"
            render={({ field }) => (
              <CountryCombobox id="country" value={field.value ?? ''} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      <BioField control={form.control} register={form.register('bio')} invalid={!!errors.bio} />

      <WebsiteField
        control={form.control}
        register={form.register('website')}
        invalid={!!errors.website}
        invalidMessage={errors.website ? t('website_invalid') : undefined}
      />

      <Button type="submit" disabled={form.formState.isSubmitting} className="w-fit">
        {form.formState.isSubmitting ? t('saving') : t('save')}
      </Button>
    </form>
  );
}
