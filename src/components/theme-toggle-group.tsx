'use client';

import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import * as React from 'react';
import { cn } from '@/lib/utils';

const options = [
  { value: 'system', icon: MonitorIcon },
  { value: 'light', icon: SunIcon },
  { value: 'dark', icon: MoonIcon },
] as const;

// Inline segmented control to switch between system, light and dark themes.
export function ThemeToggleGroup() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('ModeToggle');

  // Static lookup so the i18n checker can detect each key (it cannot follow
  // dynamic `t(value)` access).
  const labels = {
    system: t('system'),
    light: t('light'),
    dark: t('dark'),
  };

  // `theme` is only known on the client; gate the active state to avoid a
  // hydration mismatch on first paint.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center gap-0.5 rounded-full border p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            setTheme(option.value);
          }}
          className={cn(
            'flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground',
            mounted && theme === option.value && 'bg-background text-foreground shadow-sm',
          )}
        >
          <option.icon className="size-3.5" />
          <span className="sr-only">{labels[option.value]}</span>
        </button>
      ))}
    </div>
  );
}
