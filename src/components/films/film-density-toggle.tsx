'use client';

import { Grid3x3Icon, LayoutGridIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { FilmDensity } from '@/validations/FilmValidation';

const OPTIONS = [
  { value: 'compact' as const, Icon: Grid3x3Icon },
  { value: 'comfortable' as const, Icon: LayoutGridIcon },
];

// `sm` for the narrow profile column, `md` for the full-width catalogue toolbar.
const SIZES = {
  sm: { button: 'size-6', icon: 'size-3.5' },
  md: { button: 'size-7', icon: 'size-4' },
};

// Compact 12-col / comfortable 6-col grid switch shared by the toolbar and profile grids.
export function FilmDensityToggle(props: {
  density: FilmDensity;
  onChange: (value: FilmDensity) => void;
  size?: 'sm' | 'md';
}) {
  const t = useTranslations('Films');
  const size = SIZES[props.size ?? 'md'];

  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-border p-0.5">
      {OPTIONS.map(({ value, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={props.density === value}
          aria-label={t(`density_${value}`)}
          onClick={() => {
            props.onChange(value);
          }}
          className={cn(
            'inline-flex items-center justify-center rounded transition-colors',
            size.button,
            props.density === value
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className={size.icon} />
        </button>
      ))}
    </div>
  );
}
