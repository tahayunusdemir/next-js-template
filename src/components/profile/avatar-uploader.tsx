'use client';

import { useUser } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { initialsOf } from '@/lib/profile';
import { useRouter } from '@/libs/I18nNavigation';

export function AvatarUploader() {
  const t = useTranslations('ProfileSettingsPage');
  const { user } = useUser();
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pending, setPending] = React.useState(false);

  const name = user?.fullName ?? user?.username ?? '';
  const initials = initialsOf(name);

  const onSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !user) {
      return;
    }

    setPending(true);
    const result = await user
      .setProfileImage({ file })
      .then(() => true)
      .catch(() => false);
    setPending(false);
    event.target.value = '';

    if (result) {
      router.refresh();
      toast.success(t('avatar_updated'));
    } else {
      toast.error(t('avatar_error'));
    }
  };

  const onRemove = async () => {
    if (!user) {
      return;
    }

    setPending(true);
    const result = await user
      .setProfileImage({ file: null })
      .then(() => true)
      .catch(() => false);
    setPending(false);

    if (result) {
      router.refresh();
      toast.success(t('avatar_removed'));
    } else {
      toast.error(t('avatar_error'));
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16 rounded-2xl">
        <AvatarImage src={user?.imageUrl ?? ''} alt={name} />
        <AvatarFallback className="rounded-2xl">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            {t('avatar_change')}
          </Button>
          {user?.hasImage ? (
            <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={onRemove}>
              {t('avatar_remove')}
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">{t('avatar_hint')}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label={t('avatar_change')}
        className="hidden"
        onChange={onSelect}
      />
    </div>
  );
}
