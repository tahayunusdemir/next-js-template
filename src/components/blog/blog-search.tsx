'use client';

import { SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { usePathname, useRouter } from '@/libs/I18nNavigation';

// Live, URL-backed search over the listing. The query lives in `?q=` so results are
// shareable and survive a refresh; the `tag` param is preserved so search composes with
// the tag filter. Debounced to avoid a navigation per keystroke. Adapted from
// chanhdai.com's PostSearchInput, using Next's own search-params instead of a library.
export function BlogSearch() {
  const t = useTranslations('Blog');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [value, setValue] = React.useState(() => searchParams.get('q') ?? '');

  React.useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  const commit = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next.trim()) {
      params.set('q', next);
    } else {
      params.delete('q');
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setValue(next);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      commit(next);
    }, 200);
  };

  return (
    <div className="relative max-w-sm">
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={t('search_placeholder')}
        aria-label={t('search_placeholder')}
        className="h-10 rounded-full pl-9"
      />
    </div>
  );
}
