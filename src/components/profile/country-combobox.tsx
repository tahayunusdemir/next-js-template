'use client';

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { COUNTRY_CODES, countryName, flagEmoji } from '@/lib/countries';
import { cn } from '@/lib/utils';

export function CountryCombobox(props: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}) {
  const t = useTranslations('ProfileSettingsPage');
  const locale = useLocale();
  const [open, setOpen] = React.useState(false);

  const options = COUNTRY_CODES.map((code) => ({ code, name: countryName(code, locale) })).toSorted(
    (a, b) => a.name.localeCompare(b.name, locale),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={props.id}
            type="button"
            variant="outline"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {props.value ? (
              <span className="inline-flex items-center gap-2">
                <span aria-hidden>{flagEmoji(props.value)}</span>
                {countryName(props.value, locale)}
              </span>
            ) : (
              <span className="text-muted-foreground">{t('country_placeholder')}</span>
            )}
            <ChevronsUpDownIcon className="size-4 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command>
          <CommandInput placeholder={t('country_search')} />
          <CommandList>
            <CommandEmpty>{t('country_empty')}</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.code}
                value={option.name}
                keywords={[option.code]}
                onSelect={() => {
                  props.onChange(option.code === props.value ? '' : option.code);
                  setOpen(false);
                }}
              >
                <span aria-hidden>{flagEmoji(option.code)}</span>
                {option.name}
                <CheckIcon
                  className={cn(
                    'ml-auto size-4',
                    option.code === props.value ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
