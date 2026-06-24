'use client';

import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from '@/libs/I18nNavigation';
import { routing } from '@/libs/I18nRouting';

// Inline segmented control to switch between the available locales.
export function LanguageToggleGroup() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-0.5 rounded-full border p-0.5">
      {routing.locales.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => {
            if (value === locale) {
              return;
            }

            const { search } = window.location;
            router.push(`${pathname}${search}`, { locale: value, scroll: false });
          }}
          className={cn(
            'flex h-6 items-center justify-center rounded-full px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground',
            locale === value && 'bg-background text-foreground shadow-sm',
          )}
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
